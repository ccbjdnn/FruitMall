<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { fruitsData } from '@/data/fruits'

const router = useRouter()

const cartStore = useCartStore()

//分类列表，自动从水果数据中提取
const categories = computed(() => {
  const set = new Set(fruits.value.map((f) => f.category))
  return ['全部', ...Array.from(set)]
})
const activeCategory = ref('全部')
const searchKeyword = ref('')

const fruits = ref(fruitsData)

//根据分类和搜索关键词过滤水果列表
const filteredFruits = computed(() => {
  let list = fruits.value
  if (activeCategory.value !== '全部') {
    list = list.filter((f) => f.category === activeCategory.value)
  }
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase()
    list = list.filter(
      (f) => f.name.toLowerCase().includes(kw) || f.desc.toLowerCase().includes(kw) || f.category.toLowerCase().includes(kw),
    )
  }
  return list
})

// 加入购物车
const addToCart = (fruit) => {
  cartStore.addItem(fruit)
}

// Toast 提示
const toastMsg = ref('')
let toastTimer = null
const showToast = (msg) => {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 1500)
}
</script>

<template>
  <div class="home-page">
    <!-- Header -->
    <header class="home-header">
      <h1 class="app-title">🍉 鲜果时光</h1>
      <router-link to="/cart" class="cart-icon">
        🛒
        <span v-if="cartStore.totalCount" class="badge">{{ cartStore.totalCount }}</span>
      </router-link>
    </header>

    <!-- Search -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索水果名称..."
        class="search-input"
      />
      <span v-if="searchKeyword" class="clear-btn" @click="searchKeyword = ''">✕</span>
    </div>

    <!-- Categories -->
    <div class="categories-wrapper">
      <div class="categories-scroll">
        <span
          v-for="cat in categories"
          :key="cat"
          class="category-tag"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </span>
      </div>
    </div>

    <!-- Fruit Grid -->
    <div class="fruit-grid">
      <div v-for="fruit in filteredFruits" :key="fruit.id" class="fruit-card" @click="router.push(`/fruit/${fruit.id}`)">
        <div class="fruit-image">
          <span class="fruit-emoji-display">{{ fruit.image }}</span>
        </div>
        <div class="fruit-info">
          <h3 class="fruit-name">{{ fruit.name }}</h3>
          <p class="fruit-desc">{{ fruit.desc }}</p>
          <div class="fruit-bottom">
            <span class="fruit-price">
              <em>¥</em>{{ fruit.specs[0].price }}
              <small>/{{ fruit.specs[0].label }}</small>
            </span>
            <button class="add-btn" @click.stop="addToCart(fruit); showToast('已加入购物车')">+</button>
          </div>
        </div>
      </div>
      <div v-if="filteredFruits.length === 0" class="empty-tip">
        <p>😔 没有找到相关水果</p>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
    </transition>
  </div>
</template>

<style scoped>
.home-page {
  padding-bottom: 70px;
  min-height: 100vh;
  background: #f8f8f8;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
}

.cart-icon {
  position: relative;
  font-size: 24px;
  text-decoration: none;
  color: #fff;
}

.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #fff;
  color: #ff6b6b;
  font-size: 11px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  padding: 0 4px;
}

.search-bar {
  display: flex;
  align-items: center;
  margin: 12px 16px;
  background: #fff;
  border-radius: 24px;
  padding: 0 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-icon {
  font-size: 16px;
  margin-right: 8px;
  color: #999;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px 0;
  font-size: 14px;
  background: transparent;
}

.clear-btn {
  font-size: 16px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.categories-wrapper {
  padding: 0 16px;
  margin-bottom: 10px;
}

.categories-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.categories-scroll::-webkit-scrollbar {
  display: none;
}

.category-tag {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  background: #fff;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.category-tag.active {
  background: #ff6b6b;
  color: #fff;
}

.fruit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 16px;
}

.fruit-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}
.fruit-card:active {
  transform: scale(0.98);
}

.fruit-image {
  width: 100%;
  height: 140px;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5f5, #fff8f0);
}

.fruit-emoji-display {
  font-size: 64px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.fruit-info {
  padding: 10px 12px 12px;
}

.fruit-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.fruit-desc {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px;
}

.fruit-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fruit-price {
  font-size: 16px;
  font-weight: 700;
  color: #ff6b6b;
}

.fruit-price em {
  font-size: 12px;
  font-style: normal;
}

.fruit-price small {
  font-size: 11px;
  font-weight: 400;
  color: #aaa;
}

.add-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ff6b6b;
  color: #fff;
  border: none;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.add-btn:active {
  background: #e55a5a;
}

.empty-tip {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 0;
  font-size: 16px;
  color: #bbb;
}

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