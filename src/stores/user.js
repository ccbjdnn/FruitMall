import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const TOKEN_KEY = 'fruitmall_token'
const USERS_KEY = 'fruitmall_users'
const CURRENT_USER_KEY = 'fruitmall_current_user'
const INITIAL_BALANCE = 1000

// 生成一个简单的 token
function generateToken() {
  return 'tk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10)
}

// 加载用户
function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

// 保存用户列表
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// 保存当前用户信息
function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

// 加载当前用户信息
function loadCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null
  } catch {
    return null
  }
}

const savedUser = loadCurrentUser()
const savedToken = localStorage.getItem(TOKEN_KEY)

export const useUserStore = defineStore('user', () => {
  const token = ref(savedToken || '')
  const name = ref(savedUser?.name || '水果达人')
  const avatar = ref(savedUser?.avatar || '')
  const bio = ref(savedUser?.bio || '这个人很懒，什么都没写~')
  const phone = ref(savedUser?.phone || '')
  const username = ref(savedUser?.username || '')
  const balance = ref(savedUser?.balance ?? INITIAL_BALANCE)

  const isLoggedIn = computed(() => !!token.value)

  // 将当前用户信息持久化到 localStorage
  function persistCurrentUser() {
    saveCurrentUser({
      username: username.value,
      name: name.value,
      avatar: avatar.value,
      bio: bio.value,
      phone: phone.value,
      balance: balance.value,
    })
  }

  // 更新用户信息+存储
  function updateProfile({ name: newName, avatar: newAvatar, bio: newBio, phone: newPhone }) {
    if (newName !== undefined) name.value = newName
    if (newAvatar !== undefined) avatar.value = newAvatar
    if (newBio !== undefined) bio.value = newBio
    if (newPhone !== undefined) phone.value = newPhone

    if (isLoggedIn.value) {
      persistCurrentUser()
    }
  }

  // 购买逻辑
  function deductBalance(amount) {
    if (balance.value < amount) {
      return { success: false, error: '余额不足' }
    }
    balance.value -= amount
    if (isLoggedIn.value) {
      persistCurrentUser()
    }
    return { success: true }
  }

  // 注册逻辑
  function register({ username: uname, password }) {
    const users = loadUsers()
    const exists = users.find((u) => u.username === uname)
    if (exists) {
      return { success: false, error: '用户名已存在' }
    }
    const newUser = { username: uname, password }
    users.push(newUser)
    saveUsers(users)

    const t = generateToken()
    token.value = t
    username.value = uname
    name.value = uname
    balance.value = INITIAL_BALANCE
    localStorage.setItem(TOKEN_KEY, t)
    persistCurrentUser()
    return { success: true }
  }

  // 登录逻辑
  function login({ username: uname, password }) {
    const users = loadUsers()
    const user = users.find((u) => u.username === uname && u.password === password)
    if (!user) {
      return { success: false, error: '用户名或密码错误' }
    }
    const t = generateToken()
    token.value = t
    username.value = uname
    localStorage.setItem(TOKEN_KEY, t)

    const stored = loadCurrentUser()
    if (stored && stored.username === uname) {
      name.value = stored.name || name.value
      avatar.value = stored.avatar || avatar.value
      bio.value = stored.bio || bio.value
      phone.value = stored.phone || phone.value
      balance.value = stored.balance ?? INITIAL_BALANCE
    } else {
      name.value = uname
      avatar.value = ''
      bio.value = '这个人很懒，什么都没写~'
      phone.value = ''
      balance.value = INITIAL_BALANCE
      persistCurrentUser()
    }
    return { success: true }
  }

  // 退出登录
  function logout() {
    token.value = ''
    name.value = '水果达人'
    avatar.value = ''
    bio.value = '这个人很懒，什么都没写~'
    phone.value = ''
    username.value = ''
    balance.value = INITIAL_BALANCE
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  // 向外暴露状态和方法
  return {
    token, name, avatar, bio, phone, username, balance, isLoggedIn,
    updateProfile, deductBalance, register, login, logout,
  }
})