/**
 * AI 水果顾问 - 前端 API 客户端
 * 提供普通聊天和流式聊天两种请求方式
 */

// API 基础路径（Vercel Serverless Functions 部署在 /api 路径下）
const API_BASE = '/api'

/**
 * 普通聊天请求（非流式）
 * 发送用户消息到 AI 水果顾问，等待完整回复
 *
 * @param {Array<{role: string, content: string}>} messages - 对话消息列表
 * @returns {Promise<{success: boolean, reply?: string, message?: string}>}
 */
export async function chatWithAI(messages) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    })

    const data = await response.json()

    // 如果 HTTP 状态码异常，统一包装错误
    if (!response.ok) {
      return {
        success: false,
        message: data.message || `请求失败 (${response.status})`,
      }
    }

    return data
  } catch (error) {
    // 网络异常处理
    console.error('AI 聊天请求异常:', error)
    return {
      success: false,
      message: '网络连接异常，请检查网络后重试',
    }
  }
}

/**
 * 流式聊天请求（SSE）
 * 通过 Server-Sent Events 实现 AI 回复的逐字流式输出
 *
 * @param {Array<{role: string, content: string}>} messages - 对话消息列表
 * @param {Object} callbacks - 回调函数集合
 * @param {(chunk: string) => void} callbacks.onChunk - 接收到新文本块时调用
 * @param {(fullText: string) => void} callbacks.onDone - 流式输出完成时调用
 * @param {(error: string) => void} callbacks.onError - 发生错误时调用
 * @returns {AbortController} 可用于中断请求的控制器
 */

export function chatWithAIStream(messages, callbacks) {
  const { onChunk, onDone, onError } = callbacks

  // 创建 AbortController 用于中断请求
  const controller = new AbortController()

  // 异步执行流式请求（不阻塞调用方）
  ;(async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        onError(errorData.message || `流式请求失败 (${response.status})`)
        return
      }

      // 读取 SSE 流
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // 按行分割 SSE 事件
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留不完整行

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue

          // 提取 data: 后面的 JSON 内容
          const jsonStr = trimmed.slice(5).trim()

          // 结束标记
          if (jsonStr === '[DONE]') {
            onDone(fullText)
            return
          }

          try {
            const parsed = JSON.parse(jsonStr)
            if (parsed.error) {
              onError(parsed.error)
              return
            }
            // 提取 delta 内容（DeepSeek 流式响应格式）
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullText += delta
              onChunk(delta)
            }
          } catch {
            // 解析失败跳过此行
          }
        }
      }

      // 流结束但没收到 [DONE] 标记
      onDone(fullText)
    } catch (error) {
      if (error.name === 'AbortError') {
        // 用户主动中断，不报错
        return
      }
      console.error('AI 流式聊天异常:', error)
      onError('网络连接异常，请检查网络后重试')
    }
  })()

  return controller
}