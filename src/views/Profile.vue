<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

const isEditing = ref(false)
const editForm = ref({
  name: '',
  avatar: '',
  bio: '',
  phone: '',
})

const avatarOptions = [
  { emoji: '👦', color: '#ff6b6b' },
  { emoji: '👧', color: '#ff8e53' },
  { emoji: '👨', color: '#4ecdc4' },
  { emoji: '👩', color: '#45b7d1' },
  { emoji: '🧑', color: '#96ceb4' },
  { emoji: '👶', color: '#f7dc6f' },
  { emoji: '👴', color: '#bb8fce' },
  { emoji: '👵', color: '#85c1e9' },
]

const selectedAvatarIndex = ref(-1)

const isDataUrl = (str) => typeof str === 'string' && str.startsWith('data:image/')

const startEdit = () => {
  editForm.value = {
    name: userStore.name,
    avatar: userStore.avatar,
    bio: userStore.bio,
    phone: userStore.phone,
  }
  if (isDataUrl(userStore.avatar)) {
    selectedAvatarIndex.value = -1
  } else {
    selectedAvatarIndex.value = avatarOptions.findIndex((a) => a.emoji === userStore.avatar)
  }
  isEditing.value = true
}

const selectAvatar = (index) => {
  selectedAvatarIndex.value = index
  editForm.value.avatar = avatarOptions[index].emoji
}

const fileInputRef = ref(null)
const triggerUpload = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过 5MB')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    editForm.value.avatar = reader.result
    selectedAvatarIndex.value = -1
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const saveProfile = () => {
  userStore.updateProfile({
    name: editForm.value.name,
    avatar: editForm.value.avatar,
    bio: editForm.value.bio,
    phone: editForm.value.phone,
  })
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
}

const handleLogout = () => {
  userStore.logout()
  isEditing.value = false
}

const formatDate = (iso) => {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const defaultAvatarEmoji = '😊'
const displayAvatar = userStore.avatar || defaultAvatarEmoji
const displayIsImage = isDataUrl(displayAvatar)
</script>

<template>
  <div class="profile-page">
    <header class="profile-header">
      <h1>个人中心</h1>
    </header>

    <!-- Not logged in -->
    <div v-if="!userStore.isLoggedIn" class="not-logged-in">
      <div class="login-avatar">🍉</div>
      <p class="login-tip">登录后享受更多优惠</p>
      <div class="login-actions">
        <button class="go-login-btn" @click="router.push('/login')">登 录</button>
        <button class="go-register-btn" @click="router.push('/register')">注 册</button>
      </div>
    </div>

    <!-- View mode (logged in) -->
    <div v-else-if="!isEditing" class="profile-view">
      <div class="avatar-section">
        <div v-if="displayIsImage" class="avatar-display avatar-image-wrapper">
          <img :src="displayAvatar" alt="头像" class="avatar-image" />
        </div>
        <div v-else class="avatar-display">{{ displayAvatar }}</div>
      </div>
      <div class="info-cards">
        <div class="info-card balance-card">
          <span class="info-label">💰 账户余额</span>
          <span class="info-value balance-value">¥{{ userStore.balance.toFixed(2) }}</span>
        </div>
        <div class="info-card">
          <span class="info-label">昵称</span>
          <span class="info-value">{{ userStore.name }}</span>
        </div>
        <div class="info-card">
          <span class="info-label">手机号</span>
          <span class="info-value">{{ userStore.phone || '未设置' }}</span>
        </div>
        <div class="info-card bio-card">
          <span class="info-label">个人简介</span>
          <span class="info-value">{{ userStore.bio }}</span>
        </div>
      </div>
      <button class="edit-btn" @click="startEdit">编辑资料</button>
    </div>

    <!-- Edit mode -->
    <div v-else class="profile-edit">
      <div class="edit-section">
        <label class="edit-label">选择头像</label>
        <div class="avatar-picker">
          <span
            v-for="(opt, idx) in avatarOptions"
            :key="idx"
            class="avatar-option"
            :class="{ selected: selectedAvatarIndex === idx }"
            :style="{ background: selectedAvatarIndex === idx ? opt.color : '#f0f0f0' }"
            @click="selectAvatar(idx)"
          >
            {{ opt.emoji }}
          </span>
          <span class="avatar-option upload-option" @click="triggerUpload" title="上传图片">
            📷
          </span>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="file-input-hidden"
          @change="handleFileChange"
        />
        <p v-if="isDataUrl(editForm.avatar)" class="custom-avatar-preview">
          <img :src="editForm.avatar" alt="自定义头像预览" class="preview-image" />
          <span class="custom-tag">自定义头像</span>
        </p>
      </div>

      <div class="edit-section">
        <label class="edit-label">昵称</label>
        <input
          v-model="editForm.name"
          type="text"
          class="edit-input"
          placeholder="请输入昵称"
          maxlength="20"
        />
      </div>

      <div class="edit-section">
        <label class="edit-label">手机号</label>
        <input
          v-model="editForm.phone"
          type="tel"
          class="edit-input"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </div>

      <div class="edit-section">
        <label class="edit-label">个人简介</label>
        <textarea
          v-model="editForm.bio"
          class="edit-textarea"
          placeholder="介绍一下自己吧~"
          rows="3"
          maxlength="100"
        ></textarea>
        <span class="char-count">{{ editForm.bio.length }}/100</span>
      </div>

      <div class="edit-actions">
        <button class="save-btn" @click="saveProfile">保存</button>
        <button class="cancel-btn" @click="cancelEdit">取消</button>
      </div>
    </div>

    <!-- 购买历史 (logged in) -->
    <div v-if="userStore.isLoggedIn && !isEditing" class="order-section">
      <h3 class="section-title">📋 购买历史</h3>
      <div v-if="orderStore.recentOrders.length === 0" class="no-orders">
        <span class="no-orders-icon">📭</span>
        <p>暂无购买记录</p>
      </div>
      <div v-else class="order-list">
        <div v-for="order in orderStore.recentOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <span class="order-id">{{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="order-items">
            <div v-for="item in order.items" :key="item.fruitId" class="order-item">
              <span class="order-item-emoji">{{ item.image }}</span>
              <span class="order-item-name">{{ item.name }}</span>
              <span class="order-item-spec" v-if="item.specLabel">{{ item.specLabel }}</span>
              <span class="order-item-qty">x{{ item.quantity }}</span>
              <span class="order-item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <div class="order-footer">
            <span class="order-count">共 {{ order.itemCount }} 件商品</span>
            <span class="order-total">合计 <em>¥{{ order.totalAmount.toFixed(2) }}</em></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout (logged in) -->
    <div v-if="userStore.isLoggedIn && !isEditing" class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>

    <!-- About -->
    <div class="about-section">
      <p class="about-title">关于鲜果时光</p>
      <p class="about-version">v1.0.0</p>
      <p class="about-desc">新鲜水果，每日直达 🍉</p>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 70px;
}

.profile-header {
  padding: 14px 16px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
  text-align: center;
}

.profile-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.profile-view {
  padding: 24px 16px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-display {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  overflow: hidden;
}

.avatar-image-wrapper {
  padding: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.info-cards {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.info-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.info-card:last-child {
  border-bottom: none;
}

.balance-card {
  background: linear-gradient(135deg, #fff8e1, #fff3cd);
}

.balance-value {
  font-size: 18px !important;
  font-weight: 700;
  color: #e65100 !important;
}

.info-label {
  font-size: 14px;
  color: #888;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: #333;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
}

.bio-card {
  align-items: flex-start;
}

.bio-card .info-value {
  line-height: 1.5;
}

.edit-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.edit-btn:active {
  background: #e55a5a;
}

/* Not logged in */
.not-logged-in {
  text-align: center;
  padding: 40px 24px;
}

.login-avatar {
  font-size: 72px;
  margin-bottom: 16px;
}

.login-tip {
  font-size: 15px;
  color: #888;
  margin: 0 0 28px;
}

.login-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
}

.go-login-btn,
.go-register-btn {
  padding: 12px 40px;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.go-login-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
}

.go-register-btn {
  background: #fff;
  color: #ff6b6b;
  border: 1.5px solid #ff6b6b;
}

/* Logout */
.logout-section {
  padding: 0 16px;
}

.logout-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background: #fff;
  color: #ff6b6b;
  border: 1px solid #eee;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.logout-btn:active {
  background: #f9f9f9;
}

/* Edit mode */
.profile-edit {
  padding: 20px 16px;
}

.edit-section {
  margin-bottom: 20px;
}

.edit-label {
  display: block;
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.avatar-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.avatar-option {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
}
.avatar-option:active {
  transform: scale(0.9);
}
.avatar-option.selected {
  border: 3px solid #333;
}

.upload-option {
  background: #e8f5e9 !important;
  border: 2px dashed #4caf50;
}

.file-input-hidden {
  display: none;
}

.custom-avatar-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.preview-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #4caf50;
}

.custom-tag {
  font-size: 12px;
  color: #4caf50;
  font-weight: 600;
}

.edit-input,
.edit-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
  box-sizing: border-box;
  font-family: inherit;
}
.edit-input:focus,
.edit-textarea:focus {
  border-color: #ff6b6b;
}

.edit-textarea {
  resize: none;
}

.char-count {
  font-size: 12px;
  color: #bbb;
  float: right;
  margin-top: 4px;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

.save-btn,
.cancel-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.save-btn {
  background: #ff6b6b;
  color: #fff;
}
.save-btn:active {
  background: #e55a5a;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}
.cancel-btn:active {
  background: #e0e0e0;
}

.about-section {
  text-align: center;
  padding: 30px 16px;
  margin-top: 10px;
}

.about-title {
  font-size: 14px;
  color: #888;
  margin: 0 0 4px;
}

.about-version {
  font-size: 12px;
  color: #bbb;
  margin: 0 0 4px;
}

.about-desc {
  font-size: 12px;
  color: #bbb;
  margin: 0;
}

/* Order history */
.order-section {
  padding: 0 16px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.no-orders {
  text-align: center;
  padding: 32px 0;
  background: #fff;
  border-radius: 12px;
}

.no-orders-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 8px;
}

.no-orders p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #f0f0f0;
}

.order-id {
  font-size: 12px;
  color: #999;
  font-family: monospace;
}

.order-date {
  font-size: 12px;
  color: #bbb;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.order-item-emoji {
  font-size: 20px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff5f5;
  border-radius: 6px;
  flex-shrink: 0;
}

.order-item-name {
  flex: 1;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-item-spec {
  font-size: 11px;
  color: #aaa;
  background: #f5f5f5;
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.order-item-qty {
  color: #888;
  flex-shrink: 0;
}

.order-item-price {
  font-weight: 600;
  color: #ff6b6b;
  flex-shrink: 0;
  min-width: 48px;
  text-align: right;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
}

.order-count {
  font-size: 12px;
  color: #999;
}

.order-total {
  font-size: 13px;
  color: #333;
}

.order-total em {
  font-size: 15px;
  font-weight: 700;
  color: #ff6b6b;
  font-style: normal;
}
</style>
