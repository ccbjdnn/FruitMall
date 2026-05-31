<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const cartStore = useCartStore()

const tabs = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/cart', label: '购物车', icon: '🛒' },
  { path: '/ai', label: '水果顾问', icon: '🍎' },
  { path: '/profile', label: '我的', icon: '👤' },
]

const isTabPage = computed(() => tabs.some((t) => t.path === route.path))

const isActive = (path) => route.path === path
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Bottom Tab Bar -->
    <nav v-if="isTabPage" class="tab-bar">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="tab-item"
        :class="{ active: isActive(tab.path) }"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.path === '/cart' && cartStore.totalCount" class="tab-badge">
          {{ cartStore.totalCount }}
        </span>
      </router-link>
    </nav>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f8f8f8;
  color: #333;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
}

input,
textarea {
  font-family: inherit;
}

.app-container {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8f8f8;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  background: #fff;
  border-top: 1px solid #eee;
  padding: 6px 0 env(safe-area-inset-bottom, 6px);
  z-index: 50;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
  position: relative;
  text-decoration: none;
  color: #999;
  transition: color 0.2s;
}

.tab-item.active {
  color: #ff6b6b;
}

.tab-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
}

.tab-badge {
  position: absolute;
  top: 2px;
  right: 50%;
  transform: translateX(18px);
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

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>