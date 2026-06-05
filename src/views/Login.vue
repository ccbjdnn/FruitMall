<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: '',
})

const errorMsg = ref('')
const loading = ref(false)

const handleLogin = async () => {
  errorMsg.value = ''

  if (!form.value.username.trim()) {
    errorMsg.value = '请输入用户名'
    return
  }
  if (!form.value.password) {
    errorMsg.value = '请输入密码'
    return
  }
  if (form.value.password.length < 6) {
    errorMsg.value = '密码长度不能少于6位'
    return
  }

  loading.value = true
  // 模拟异步
  await new Promise((r) => setTimeout(r, 300))

  // 调用 store 的登录方法
  const result = userStore.login({
    username: form.value.username.trim(),
    password: form.value.password,
  })

  loading.value = false

  if (result.success) {
    const redirect = route.query.redirect ||'/profile'
    router.push(redirect)
  } else {
    errorMsg.value = result.error
  }
}
</script>

<template>
  <div class="login-page">
    <header class="login-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h1>登录</h1>
      <span class="placeholder"></span>
    </header>

    <div class="login-form">
      <div class="form-logo">🍉</div>
      <h2 class="form-title">欢迎来到鲜果时光</h2>

      <div class="input-group">
        <label class="input-label">用户名</label>
        <input
          v-model="form.username"
          type="text"
          class="form-input"
          placeholder="请输入用户名"
          maxlength="20"
          @keyup.enter="handleLogin"
        />
      </div>

      <div class="input-group">
        <label class="input-label">密码</label>
        <input
          v-model="form.password"
          type="password"
          class="form-input"
          placeholder="请输入密码"
          maxlength="20"
          @keyup.enter="handleLogin"
        />
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <button class="login-btn" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登 录' }}
      </button>

      <p class="switch-link">
        还没有账号？
        <router-link to="/register">立即注册</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
}

.login-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.back-btn {
  font-size: 20px;
  cursor: pointer;
  width: 32px;
}

.placeholder {
  width: 32px;
}

.login-form {
  padding: 40px 24px;
}

.form-logo {
  font-size: 56px;
  text-align: center;
  margin-bottom: 12px;
}

.form-title {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 30px;
}

.input-group {
  margin-bottom: 18px;
}

.input-label {
  display: block;
  font-size: 13px;
  color: #888;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  background: #fff;
  box-sizing: border-box;
  font-family: inherit;
}

.form-input:focus {
  border-color: #ff6b6b;
}

.error-msg {
  color: #ff6b6b;
  font-size: 13px;
  margin: -6px 0 10px;
  padding-left: 4px;
}

.login-btn {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

.login-btn:active {
  opacity: 0.85;
}

.login-btn:disabled {
  opacity: 0.6;
}

.switch-link {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-top: 24px;
}

.switch-link a {
  color: #ff6b6b;
  text-decoration: none;
  font-weight: 500;
}
</style>