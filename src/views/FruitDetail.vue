<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { fruitsData } from '@/data/fruits'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const allFruits = fruitsData

// 根据路由参数获取当前水果详情
const fruit = computed(() => {
  const id = Number(route.params.id)
  return allFruits.find((f) => f.id === id) || null
})

const selectedSpec = ref(null)
const quantity = ref(1)

// 初始化默认规格（第一个）
if (fruit.value) {
  selectedSpec.value = fruit.value.specs[0]
}

// 计算总价
const totalPrice = computed(() => {
  if (!fruit.value || !selectedSpec.value) return 0
  return (selectedSpec.value.price * quantity.value).toFixed(2)
})

//减少数量
const decreaseQty = () => {
  if (quantity.value > 1) quantity.value--
}

//增加数量
const increaseQty = () => {
  if (quantity.value < 99) quantity.value++
}

// 需要登录才能操作
const requireLogin = () => {
  if (!userStore.isLoggedIn) {
    const currentPath = route.fullPath
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    return false
  }
  return true
}

// 加入购物车
const addToCart = () => {
  if (!fruit.value) return
  if (!requireLogin()) return
  cartStore.addItem(fruit.value, quantity.value, selectedSpec.value)
  showToast(`已加入购物车 (${selectedSpec.value.label} x${quantity.value})`)
}

// 立即购买
const buyNow = () => {
  if (!fruit.value) return
  if (!requireLogin()) return
  cartStore.addItem(fruit.value, quantity.value, selectedSpec.value)
  router.push('/cart')
}

const toastMsg = ref('')
let toastTimer = null
const showToast = (msg) => {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 1500)
}
</script>

<template>
  <div class="detail-page" v-if="fruit">
    <!-- Header -->
    <header class="detail-header">
      <button class="back-btn" @click="router.back()">←</button>
      <h1 class="header-title">商品详情</h1>
      <router-link to="/cart" class="cart-icon">
        🛒
        <span v-if="cartStore.totalCount" class="badge">{{ cartStore.totalCount }}</span>
      </router-link>
    </header>

    <!-- 商品图片区 -->
    <div class="fruit-hero">
      <span class="hero-emoji-display">{{ fruit.image }}</span>
    </div>

    <!-- 商品基本信息 -->
    <div class="info-section">
      <div class="name-row">
        <h2 class="fruit-name">{{ fruit.name }}</h2>
        <span class="category-tag">{{ fruit.category }}</span>
      </div>
      <p class="fruit-desc">{{ fruit.desc }}</p>
      <div class="price-row">
        <span class="price">
          <em>¥</em>{{ selectedSpec ? selectedSpec.price : '--' }}
          <small>/{{ selectedSpec ? selectedSpec.label : '' }}</small>
        </span>
        <span class="sales">已售 {{ fruit.sales }}+ 件</span>
      </div>
    </div>

    <!-- 规格选择 -->
    <div class="spec-section">
      <h3 class="section-title">规格选择</h3>
      <div class="spec-list">
        <span
          v-for="spec in fruit.specs"
          :key="spec.label"
          class="spec-tag"
          :class="{ active: selectedSpec?.label === spec.label }"
          @click="selectedSpec = spec"
        >
          {{ spec.label }} <em class="spec-price">¥{{ spec.price }}</em>
        </span>
      </div>
    </div>

    <!-- 数量选择 -->
    <div class="qty-section">
      <h3 class="section-title">购买数量</h3>
      <div class="qty-control">
        <button class="qty-btn" @click="decreaseQty" :disabled="quantity <= 1">−</button>
        <span class="qty-num">{{ quantity }}</span>
        <button class="qty-btn" @click="increaseQty" :disabled="quantity >= 99">+</button>
        <span class="stock-info">库存 {{ fruit.stock }} 件</span>
      </div>
    </div>

    <!-- 商品详情描述 -->
    <div class="detail-section">
      <h3 class="section-title">商品详情</h3>
      <p class="detail-text">{{ fruit.detail }}</p>
      <div class="detail-meta">
        <span>产地：{{ fruit.origin }}</span>
        <span>库存：{{ fruit.stock }} {{ fruit.unit }}</span>
      </div>
    </div>

    <!-- 商家信息 -->
    <div class="merchant-section">
      <h3 class="section-title">商家信息</h3>
      <div class="merchant-card" @click="router.push(`/merchant/${encodeURIComponent(fruit.merchant)}`)">
        <span class="merchant-avatar">{{ fruit.merchantAvatar }}</span>
        <div class="merchant-info">
          <span class="merchant-name">{{ fruit.merchant }}</span>
          <span class="merchant-desc">{{ fruit.merchantDesc }}</span>
        </div>
        <span class="merchant-badge">认证</span>
        <span class="merchant-arrow">›</span>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <div class="total-info">
        <span class="total-label">合计：</span>
        <span class="total-price"><em>¥</em>{{ totalPrice }}</span>
      </div>
      <div class="action-btns">
        <button class="cart-btn" @click="addToCart">加入购物车</button>
        <button class="buy-btn" @click="buyNow">立即购买</button>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
    </transition>
  </div>

  <!-- 商品不存在 -->
  <div class="not-found" v-else>
    <p>😔 商品不存在</p>
    <button class="back-home-btn" @click="router.push('/')">返回首页</button>
  </div>
</template>

<style scoped>
.detail-page {
  padding-bottom: 80px;
  min-height: 100vh;
  background: #f8f8f8;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.back-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #333;
  padding: 0;
  width: 32px;
  text-align: left;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.cart-icon {
  position: relative;
  font-size: 22px;
  text-decoration: none;
  color: #333;
}

.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #ff6b6b;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 0 4px;
}

/* 商品大图 */
.fruit-hero {
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5f5, #fff0e8, #fff8f0);
}

.hero-emoji-display {
  font-size: 96px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* 基本信息 */
.info-section {
  background: #fff;
  padding: 16px;
  margin-bottom: 10px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.fruit-name {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.category-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #fff0e8;
  color: #ff8e53;
  flex-shrink: 0;
}

.fruit-desc {
  font-size: 13px;
  color: #999;
  margin: 0 0 10px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #ff6b6b;
}

.price em {
  font-size: 14px;
  font-style: normal;
}

.price small {
  font-size: 12px;
  font-weight: 400;
  color: #aaa;
}

.sales {
  font-size: 12px;
  color: #bbb;
}

/* 规格选择 */
.spec-section,
.qty-section,
.detail-section,
.merchant-section {
  background: #fff;
  padding: 16px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px;
}

.spec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-tag {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  background: #f5f5f5;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.spec-tag.active {
  background: #fff0e8;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.spec-price {
  font-style: normal;
  font-size: 11px;
  color: #999;
  margin-left: 2px;
}

/* 数量选择 */
.qty-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: all 0.2s;
}

.qty-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.qty-btn:not(:disabled):active {
  background: #f5f5f5;
}

.qty-num {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  min-width: 32px;
  text-align: center;
}

.stock-info {
  font-size: 12px;
  color: #bbb;
  margin-left: 8px;
}

/* 商品详情 */
.detail-text {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin: 0 0 12px;
}

.detail-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

/* 商家信息 */
.merchant-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.merchant-card:active {
  background: #f0f0f0;
}

.merchant-avatar {
  font-size: 36px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
}

.merchant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.merchant-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.merchant-desc {
  font-size: 12px;
  color: #999;
}

.merchant-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e8f5e9;
  color: #4caf50;
}

.merchant-arrow {
  font-size: 22px;
  color: #ccc;
  margin-left: -4px;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.total-label {
  font-size: 13px;
  color: #666;
}

.total-price {
  font-size: 22px;
  font-weight: 700;
  color: #ff6b6b;
}

.total-price em {
  font-size: 13px;
  font-style: normal;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.cart-btn,
.buy-btn {
  padding: 10px 20px;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.cart-btn {
  background: #fff;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.cart-btn:active {
  background: #fff0e8;
}

.buy-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
}

.buy-btn:active {
  opacity: 0.85;
}

/* 不存在 */
.not-found {
  text-align: center;
  padding: 100px 0;
  font-size: 16px;
  color: #bbb;
}

.back-home-btn {
  margin-top: 16px;
  padding: 10px 24px;
  border-radius: 20px;
  background: #ff6b6b;
  color: #fff;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 100;
  pointer-events: none;
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>