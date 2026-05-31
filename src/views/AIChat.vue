<script setup>
/**
 * AI 水果顾问 - 聊天界面组件
 * 支持流式输出（SSE）实现逐字显示回复内容
 */
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { chatWithAIStream } from '@/api/ai'

// ============ 响应式数据 ============

/** 用户输入的消息文本 */
const inputText = ref('')

/** 聊天消息记录列表 */
const chatList = ref([
  {
    role: 'assistant',
    content:
      '你好！我是 FruitMall 的智能水果顾问 🍎\n\n我可以帮你：\n• 根据需求推荐水果\n• 解答水果营养问题\n• 提供饮食搭配建议\n\n请问有什么可以帮你的？',
  },
])

/** 是否正在等待 AI 回复 */
const isLoading = ref(false)

/** 当前流式输出的临时文本 */
const streamingText = ref('')

/** 聊天列表容器 DOM 引用 */
const chatContainer = ref(null)

/** 当前流式请求的 AbortController（用于中断） */
let currentController = null

// ============ 预设快捷问题 ============

/** 快捷问题列表 */
const quickQuestions = [
  '减肥适合吃什么水果',
  '健身吃什么水果',
  '补充维生素C吃什么水果',
  '哪些水果糖分低',
  '哪些水果适合老人',
  '哪些水果适合儿童',
]

// ============ 方法 ============

/** 滚动聊天列表到底部 */
async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

/** 构建发送给 AI 的对话上下文（保留最近 10 轮） */
function buildMessages() {
  const recentMessages = chatList.value.slice(-10)
  return recentMessages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))
}

/** 发送消息（流式模式） */
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  // 1. 将用户消息添加到聊天列表
  chatList.value.push({ role: 'user', content: text })
  inputText.value = ''
  await scrollToBottom()

  // 2. 添加 AI 占位消息
  const aiMessageIndex = chatList.value.length
  chatList.value.push({ role: 'assistant', content: '' })
  streamingText.value = ''
  isLoading.value = true
  await scrollToBottom()

  // 3. 调用流式 API
  const messages = buildMessages()

  currentController = chatWithAIStream(messages, {
    onChunk(chunk) {
      streamingText.value += chunk
      chatList.value[aiMessageIndex].content = streamingText.value
      scrollToBottom()
    },
    onDone(fullText) {
      chatList.value[aiMessageIndex].content = fullText || streamingText.value
      streamingText.value = ''
      isLoading.value = false
      currentController = null
      scrollToBottom()
    },
    onError(errorMsg) {
      chatList.value[aiMessageIndex].content = '\u274c ' + errorMsg
      streamingText.value = ''
      isLoading.value = false
      currentController = null
      scrollToBottom()
    },
  })
}

/** 点击快捷问题 */
function tapQuickQuestion(question) {
  inputText.value = question
  sendMessage()
}

/** 中断当前流式回复 */
function stopStreaming() {
  if (currentController) {
    currentController.abort()
    currentController = null
    isLoading.value = false
    if (streamingText.value) {
      const lastMsg = chatList.value[chatList.value.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.content = streamingText.value + '\uff08\u5df2\u4e2d\u65ad\uff09'
      }
      streamingText.value = ''
    }
  }
}

/** 处理回车键发送 */
function handleKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// ============ 生命周期 ============

onBeforeUnmount(() => {
  if (currentController) {
    currentController.abort()
  }
})
</script>

<template>
  <div class="ai-chat-page">
    <!-- 顶部标题栏 -->
    <header class="chat-header">
      <h1 class="chat-title">
        <span class="title-icon">🍎</span>
        水果顾问
      </h1>
      <p class="chat-subtitle">AI 智能推荐 · 营养解答</p>
    </header>

    <!-- 聊天消息列表 -->
    <div ref="chatContainer" class="chat-messages">
      <div
        v-for="(msg, index) in chatList"
        :key="index"
        class="message-wrapper"
      >
        <!-- AI 消息 -->
        <div v-if="msg.role === 'assistant'" class="message message-ai">
          <div class="message-avatar">🍎</div>
          <div class="message-bubble ai-bubble">
            <div class="message-text">{{ msg.content }}</div>
            <!-- 流式输出闪烁光标 -->
            <span
              v-if="isLoading && index === chatList.length - 1"
              class="streaming-cursor"
            >|</span>
          </div>
        </div>

        <!-- 用户消息 -->
        <div v-else class="message message-user">
          <div class="message-bubble user-bubble">
            <div class="message-text">{{ msg.content }}</div>
          </div>
          <div class="message-avatar">👤</div>
        </div>
      </div>
    </div>

    <!-- 快捷问题区域 -->
    <div v-if="!isLoading" class="quick-questions">
      <div class="quick-title">💡 快速提问</div>
      <div class="quick-tags">
        <button
          v-for="q in quickQuestions"
          :key="q"
          class="quick-tag"
          @click="tapQuickQuestion(q)"
        >
          {{ q }}
        </button>
      </div>
    </div>

    <!-- 底部输入区域 -->
    <div class="chat-input-area">
      <div class="input-wrapper">
        <input
          v-model="inputText"
          type="text"
          class="chat-input"
          placeholder="请输入水果相关的问题..."
          :disabled="isLoading"
          @keydown="handleKeydown"
        />
        <!-- 发送 / 中断按钮 -->
        <button
          v-if="!isLoading"
          class="send-btn"
          :class="{ disabled: !inputText.trim() }"
          :disabled="!inputText.trim()"
          @click="sendMessage"
        >
          发送
        </button>
        <button v-else class="send-btn stop-btn" @click="stopStreaming">
          停止
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== 页面整体布局 ========== */
.ai-chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f4f0;
}

/* ========== 顶部标题栏 ========== */
.chat-header {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: #fff;
  padding: 16px 20px;
  padding-top: max(16px, env(safe-area-inset-top));
  text-align: center;
  flex-shrink: 0;
}

.chat-title {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.title-icon {
  font-size: 22px;
}

.chat-subtitle {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 4px;
}

/* ========== 聊天消息列表 ========== */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
}

.message {
  display: flex;
  gap: 8px;
  max-width: 85%;
}

.message-ai {
  align-self: flex-start;
}

.message-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

/* 头像 */
.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: #fff;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 聊天气泡 */
.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
  position: relative;
}

.ai-bubble {
  background: #fff;
  border-top-left-radius: 4px;
  color: #333;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.user-bubble {
  background: #4caf50;
  border-top-right-radius: 4px;
  color: #fff;
}

.message-text {
  white-space: pre-wrap;
}

/* 流式输出闪烁光标 */
.streaming-cursor {
  display: inline-block;
  color: #4caf50;
  font-weight: bold;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* ========== 快捷问题区域 ========== */
.quick-questions {
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e8f5e9;
  flex-shrink: 0;
}

.quick-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  padding: 6px 14px;
  border-radius: 16px;
  border: 1px solid #c8e6c9;
  background: #f1f8e9;
  color: #4caf50;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.quick-tag:hover {
  background: #4caf50;
  color: #fff;
  border-color: #4caf50;
}

.quick-tag:active {
  transform: scale(0.96);
}

/* ========== 底部输入区域 ========== */
.chat-input-area {
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #e8f5e9;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background: #f5f5f5;
}

.chat-input:focus {
  border-color: #4caf50;
  background: #fff;
}

.chat-input:disabled {
  background: #eee;
  color: #999;
}

.send-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 24px;
  background: #4caf50;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover {
  background: #43a047;
}

.send-btn.disabled {
  background: #c8e6c9;
  cursor: not-allowed;
}

.stop-btn {
  background: #ff6b6b;
}

.stop-btn:hover {
  background: #e53935;
}
</style>