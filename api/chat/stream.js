/**
 * Vercel Serverless Function - POST /api/chat/stream
 * 水果顾问 AI 聊天接口（流式 SSE）
 * 调用 DeepSeek Chat Completions API (stream: true)
 */

// 简易内存限流存储
const rateLimitMap = new Map()

// 限流配置：每个 IP 每分钟最多 20 次请求
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_MS = 60 * 1000

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
 */
function checkRateLimit(ip) {
  cleanRateLimitMap()
  const now = Date.now()
  let record = rateLimitMap.get(ip)

  if (!record || now - record.resetTime > RATE_LIMIT_WINDOW_MS) {
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
 * Vercel Serverless 入口函数 - SSE 流式输出
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

  // ---- 设置 SSE 响应头 ----
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // 禁用 nginx 缓冲

  // ---- 调用 DeepSeek API (流式) ----
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000) // 流式超时 60 秒

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
        stream: true,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      res.write(
        `data: ${JSON.stringify({ error: `AI 服务响应异常 (${response.status})` })}\n\n`
      )
      res.write('data: [DONE]\n\n')
      return res.end()
    }

    // 获取可读流
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    // 逐块读取并转发 SSE 事件
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 按行分割
      const lines = buffer.split('\n')
      // 保留最后一个不完整行
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        // 直接转发 DeepSeek 的 SSE 数据行
        if (trimmed.startsWith('data:')) {
          res.write(`${trimmed}\n\n`)
        }
      }
    }

    // 处理剩余的 buffer 内容
    if (buffer.trim()) {
      const trimmed = buffer.trim()
      if (trimmed.startsWith('data:')) {
        res.write(`${trimmed}\n\n`)
      }
    }

    // 发送结束标记
    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    console.error('DeepSeek API 流式调用异常:', error)

    // 发送错误事件
    const errorMsg =
      error.name === 'AbortError'
        ? 'AI 服务响应超时，请稍后重试'
        : 'AI 服务暂时不可用，请稍后重试'

    res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`)
    res.write('data: [DONE]\n\n')
    res.end()
  }
}