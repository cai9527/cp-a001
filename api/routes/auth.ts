import { Router, type Request, type Response, type NextFunction } from 'express'
import crypto from 'crypto'
import type { UserRole } from '../../shared/types'

const router = Router()

interface CaptchaStore {
  code: string
  expireAt: number
}

interface TokenStore {
  userId: string
  username: string
  nickname: string
  role: UserRole
}

const captchaMap = new Map<string, CaptchaStore>()
export const tokenMap = new Map<string, TokenStore>()

const CAPTCHA_EXPIRE_MS = 5 * 60 * 1000

function generateCaptchaCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

function generateSvgCaptcha(code: string): string {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']
  const chars = code.split('')
  let textPath = ''
  chars.forEach((char, i) => {
    const x = 18 + i * 30
    const y = 30 + Math.floor(Math.random() * 8) - 4
    const rotate = Math.floor(Math.random() * 40) - 20
    const color = colors[Math.floor(Math.random() * colors.length)]
    textPath += `<text x="${x}" y="${y}" font-size="26" font-family="Arial, Helvetica, sans-serif" font-weight="bold" fill="${color}" transform="rotate(${rotate} ${x + 8} ${y})">${char}</text>`
  })

  let lines = ''
  for (let i = 0; i < 5; i++) {
    const x1 = Math.floor(Math.random() * 150)
    const y1 = Math.floor(Math.random() * 50)
    const x2 = Math.floor(Math.random() * 150)
    const y2 = Math.floor(Math.random() * 50)
    const color = colors[Math.floor(Math.random() * colors.length)]
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" opacity="0.5" />`
  }

  let dots = ''
  for (let i = 0; i < 40; i++) {
    const cx = Math.floor(Math.random() * 150)
    const cy = Math.floor(Math.random() * 50)
    const r = Math.random() * 1.8 + 0.5
    const color = colors[Math.floor(Math.random() * colors.length)]
    dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.6" />`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="150" height="50" fill="url(#bg)" rx="8" ry="8"/>
  <rect width="148" height="48" x="1" y="1" fill="none" stroke="#e2e8f0" stroke-width="1" rx="7" ry="7"/>
  ${lines}
  ${dots}
  ${textPath}
</svg>`
}

router.get('/captcha', async (req: Request, res: Response): Promise<void> => {
  const code = generateCaptchaCode()
  const captchaId = crypto.randomUUID()
  const svg = generateSvgCaptcha(code)
  const imageDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

  captchaMap.set(captchaId, {
    code,
    expireAt: Date.now() + CAPTCHA_EXPIRE_MS,
  })

  res.json({
    code: 0,
    message: 'success',
    data: {
      captchaId,
      image: imageDataUrl,
    },
  })
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password, captcha, captchaId } = req.body

  if (!username || !password || !captcha || !captchaId) {
    res.status(400).json({
      code: 1,
      message: '请填写完整信息',
      data: null,
    })
    return
  }

  const captchaData = captchaMap.get(captchaId)
  if (!captchaData) {
    res.status(400).json({
      code: 1,
      message: '验证码已失效，请刷新',
      data: null,
    })
    return
  }

  if (Date.now() > captchaData.expireAt) {
    captchaMap.delete(captchaId)
    res.status(400).json({
      code: 1,
      message: '验证码已过期，请刷新',
      data: null,
    })
    return
  }

  if (captchaData.code !== captcha) {
    res.status(400).json({
      code: 1,
      message: '验证码错误',
      data: null,
    })
    return
  }

  captchaMap.delete(captchaId)

  const mockUsers = [
    { id: '1', username: 'admin', password: 'admin123', nickname: '管理员', role: 'admin' },
    { id: '2', username: 'user', password: 'user123', nickname: '普通用户', role: 'user' },
  ]

  const user = mockUsers.find((u) => u.username === username && u.password === password)

  if (!user) {
    res.status(400).json({
      code: 1,
      message: '账号或密码错误',
      data: null,
    })
    return
  }

  const token = crypto.randomBytes(32).toString('hex')

  tokenMap.set(token, {
    userId: user.id,
    username: user.username,
    nickname: user.nickname,
    role: user.role as UserRole,
  })

  res.json({
    code: 0,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
      },
    },
  })
})

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    tokenMap.delete(token)
  }
  res.json({
    code: 0,
    message: '退出成功',
    data: null,
  })
})

export default router
