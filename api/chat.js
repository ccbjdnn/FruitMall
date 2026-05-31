/**
 * Vercel Serverless Function - POST /api/chat
 * 水果顾问 AI 聊天接口（非流式）
 * 调用 DeepSeek Chat Completions API
 */

// 简易内存限流存储（Vercel Serverless 无状态，使用全局变量作为简易限流）
// 注意：在 Vercel 无服务器环境中，此限流在同一实例内有效
const rateLimitMap = new Map()

// 限流配置：每个 IP 每分钟最多 20 次请求
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 分钟

/**
 * 清理过期的限流记录
 */
function cleanRateLimitMap() {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.resetTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key)
    }
  }
}

/**
 * 检查并更新 IP 限流状态
 * @param {string} ip - 客户端 IP 地址
 * @returns {{ allowed: boolean, remaining: number }}
 */
function checkRateLimit(ip) {
  cleanRateLimitMap()
  const now = Date.now()
  let record = rateLimitMap.get(ip)

  if (!record || now - record.resetTime > RATE_LIMIT_WINDOW_MS) {
    // 新窗口
    record = { count: 0, resetTime: now }
    rateLimitMap.set(ip, record)
  }

  record.count++
  if (record.count > RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count }
}

/**
 * 系统 Prompt - 水果顾问角色定义
 */
const SYSTEM_PROMPT = `你是 FruitMall 水果商城的智能水果顾问。

你的职责：
- 推荐适合用户需求的水果
- 解答水果营养相关问题
- 提供水果搭配建议
- 提供减脂、健身、补充维生素等场景的水果建议
- 回答简洁友好，控制在200字以内
- 如果用户咨询与水果无关的话题，礼貌引导回水果相关内容

你了解各种水果的营养成分、功效、适宜人群等专业知识。`

/**
 * Vercel Serverless 入口函数
 */
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 仅允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '仅支持 POST 请求',
    })
  }

  // ---- 限流检查 ----
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'

  const rateLimitResult = checkRateLimit(clientIp)
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      success: false,
      message: '请求过于频繁，请稍后再试',
    })
  }

  // ---- 参数校验 ----
  const { messages } = req.body || {}

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      message: '请求参数错误：messages 不能为空',
    })
  }

  // ---- API Key 检查 ----
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: '服务配置错误：API Key 未设置',
    })
  }

  // ---- 调用 DeepSeek API ----
  try {
    const controller = new AbortController()
    // 设置 30 秒超时
    const timeout = setTimeout(() => controller.abort(), 30000)

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 600,
        stream: false,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('DeepSeek API 错误:', response.status, errorText)
      return res.status(502).json({
        success: false,
        message: `AI 服务响应异常 (${response.status})，请稍后重试`,
      })
    }

    const data = await response.json()

    // 提取 AI 回复内容
    const reply =
      data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答您的问题，请稍后再试。'

    return res.status(200).json({
      success: true,
      reply,
    })
  } catch (error) {
    console.error('DeepSeek API 调用异常:', error)

    if (error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        message: 'AI 服务响应超时，请稍后重试',
      })
    }

    return res.status(502).json({
      success: false,
      message: 'AI 服务暂时不可用，请稍后重试',
    })
  }
}