import type { Request, Response, NextFunction } from 'express'

import { tokenMap } from '../routes/auth.js'
import { ROLE_PERMISSIONS, type Permission, type UserRole } from '../../shared/types'

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    username: string
    nickname: string
    role: UserRole
  }
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ code: 401, message: '未授权，请先登录', data: null })
    return
  }

  const token = authHeader.slice(7)
  const userInfo = tokenMap.get(token)
  if (!userInfo) {
    res.status(401).json({ code: 401, message: '登录已过期，请重新登录', data: null })
    return
  }

  req.user = userInfo
  next()
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ code: 401, message: '未授权，请先登录', data: null })
      return
    }

    const permissions = ROLE_PERMISSIONS[req.user.role]
    if (!permissions.includes(permission)) {
      res.status(403).json({ code: 403, message: '权限不足，无法执行此操作', data: null })
      return
    }

    next()
  }
}
