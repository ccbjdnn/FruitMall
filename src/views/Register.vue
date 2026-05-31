<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

const errorMsg = ref('')
const loading = ref(false)

const handleRegister = async () => {
  errorMsg.value = ''

  if (!form.value.username.trim()) {
    errorMsg.value = '请输入用户名'
    return
  }
  if (form.value.username.trim().length < 2) {
    errorMsg.value = '用户名至少2个字符'
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
  if (form.value.password !== form.value.confirmPassword) {
    errorMsg.value = '两次密码输入不一致'
    return
  }

  loading.value = true
  await new Promise((r) => setTimeout(r, 300))

  const result = userStore.register({
    username: form.value.username.trim(),
    password: form.value.password,
  })

  loading.value = false

  if (result.success) {
    router.push('/profile')
  } else {
    errorMsg.value = result.error
  }
}
</script>

<template>
  <div class="register-page">
    <header class="register-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h1>注册</h1>
      <span class="placeholder"></span>
    </header>

    <div class="register-form">
      <div class="form-logo">🍉</div>
      <h2 class="form-title">创建鲜果时光账号</h2>

      <div class="input-group">
        <label class="input-label">用户名</label>
        <input
          v-model="form.username"
          type="text"
          class="form-input"
          placeholder="请输入用户名"
          maxlength="20"
          @keyup.enter="handleRegister"
        />
      </div>

      <div class="input-group">
        <label class="input-label">密码</label>
        <input
          v-model="form.password"
          type="password"
          class="form-input"
          placeholder="请输入密码（至少6位）"
          maxlength="20"
          @keyup.enter="handleRegister"
        />
      </div>

      <div class="input-group">
        <label class="input-label">确认密码</label>
        <input
          v-model="form.confirmPassword"
          type="password"
          class="form-input"
          placeholder="请再次输入密码"
          maxlength="20"
          @keyup.enter="handleRegister"
        />
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <button class="register-btn" :disabled="loading" @click="handleRegister">
        {{ loading ? '注册中...' : '注 册' }}
      </button>

      <p class="switch-link">
        已有账号？
        <router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.register-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
}

.register-header h1 {
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

.register-form {
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

.register-btn {
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

.register-btn:active {
  opacity: 0.85;
}

.register-btn:disabled {
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