import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'

const router = Router()

interface CaptchaStore {
  code: string
  expireAt: number
}

const captchaMap = new Map<string, CaptchaStore>()

const CAPTCHA_EXPIRE_MS = 5 * 60 * 1000

function generateCaptchaCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

function generateSvgCaptcha(code: string): string {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']
  const chars = code.split('')
  let textPath = ''
  chars.forEach((char, i) => {
    const x = 20 + i * 28
    const y = 32 + Math.floor(Math.random() * 6) - 3
    const rotate = Math.floor(Math.random() * 30) - 15
    const color = colors[Math.floor(Math.random() * colors.length)]
    textPath += `<text x="${x}" y="${y}" font-size="28" font-weight="bold" fill="${color}" transform="rotate(${rotate} ${x + 8} ${y})">${char}</text>`
  })

  let lines = ''
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * 140)
    const y1 = Math.floor(Math.random() * 40)
    const x2 = Math.floor(Math.random() * 140)
    const y2 = Math.floor(Math.random() * 40)
    const color = colors[Math.floor(Math.random() * colors.length)]
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" opacity="0.6" />`
  }

  let dots = ''
  for (let i = 0; i < 30; i++) {
    const cx = Math.floor(Math.random() * 140)
    const cy = Math.floor(Math.random() * 40)
    const r = Math.random() * 1.5 + 0.5
    const color = colors[Math.floor(Math.random() * colors.length)]
    dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.7" />`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="40" viewBox="0 0 140 40">
  <rect width="140" height="40" fill="#f3f4f6" rx="6" ry="6"/>
  ${lines}
  ${dots}
  ${textPath}
</svg>`
}

router.get('/captcha', async (req: Request, res: Response): Promise<void> => {
  const code = generateCaptchaCode()
  const captchaId = crypto.randomUUID()
  const svg = generateSvgCaptcha(code)
  const imageBase64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

  captchaMap.set(captchaId, {
    code,
    expireAt: Date.now() + CAPTCHA_EXPIRE_MS,
  })

  res.json({
    code: 0,
    message: 'success',
    data: {
      captchaId,
      image: imageBase64,
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
  res.json({
    code: 0,
    message: '退出成功',
    data: null,
  })
})

export default router
