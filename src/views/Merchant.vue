<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fruitsData } from '@/data/fruits'

const route = useRoute()
const router = useRouter()

const merchantName = computed(() => decodeURIComponent(route.params.name))

// 过滤出该商家的水果列表
const merchantFruits = computed(() =>
  fruitsData.filter((f) => f.merchant === merchantName.value),
)

const merchantInfo = computed(() => {
  if (merchantFruits.value.length === 0) return null
  const first = merchantFruits.value[0]
  return {
    name: first.merchant,
    avatar: first.merchantAvatar,
    desc: first.merchantDesc,
    fruitCount: merchantFruits.value.length,
    totalSales: merchantFruits.value.reduce((s, f) => s + f.sales, 0),
  }
})
</script>

<template>
  <div class="merchant-page" v-if="merchantInfo">
    <header class="merchant-header">
      <button class="back-btn" @click="router.back()">←</button>
      <h1>商家详情</h1>
    </header>

    <!-- 商家信息卡片 -->
    <div class="merchant-hero">
      <span class="merchant-avatar">{{ merchantInfo.avatar }}</span>
      <h2 class="merchant-name">{{ merchantInfo.name }}</h2>
      <p class="merchant-desc">{{ merchantInfo.desc }}</p>
      <div class="merchant-stats">
        <div class="stat-item">
          <span class="stat-num">{{ merchantInfo.fruitCount }}</span>
          <span class="stat-label">在售商品</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ merchantInfo.totalSales }}+</span>
          <span class="stat-label">累计销量</span>
        </div>
      </div>
    </div>

    <!-- 在售水果列表 -->
    <div class="section">
      <h3 class="section-title">在售水果</h3>
      <div class="fruit-grid">
        <div
          v-for="fruit in merchantFruits"
          :key="fruit.id"
          class="fruit-card"
          @click="router.push(`/fruit/${fruit.id}`)"
        >
          <div class="fruit-image">
            <span class="fruit-emoji-display">{{ fruit.image }}</span>
          </div>
          <div class="fruit-info">
            <h4 class="fruit-name">{{ fruit.name }}</h4>
            <p class="fruit-desc">{{ fruit.desc }}</p>
            <div class="fruit-bottom">
              <span class="fruit-price">
                <em>¥</em>{{ fruit.specs[0].price }}
              </span>
              <span class="fruit-sales">已售 {{ fruit.sales }}+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <p>😔 商家不存在</p>
    <button class="back-home-btn" @click="router.push('/')">返回首页</button>
  </div>
</template>

<style scoped>
.merchant-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 40px;
}

.merchant-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin-right: 12px;
  padding: 0;
}

.merchant-header h1 {
  font-size: 18px;
  font-weight: 600;
}

.merchant-hero {
  background: #fff;
  margin: 12px 16px;
  padding: 24px 20px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.merchant-avatar {
  font-size: 56px;
  display: block;
  margin-bottom: 12px;
}

.merchant-name {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px;
}

.merchant-desc {
  font-size: 13px;
  color: #999;
  margin: 0 0 20px;
}

.merchant-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: #ff6b6b;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.section {
  padding: 0 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.fruit-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fruit-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s;
}

.fruit-card:active {
  transform: scale(0.98);
}

.fruit-image {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #fff5f5, #fff8f0);
}

.fruit-emoji-display {
  font-size: 48px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.fruit-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.fruit-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.fruit-desc {
  font-size: 12px;
  color: #999;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fruit-bottom {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
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

.fruit-sales {
  font-size: 11px;
  color: #bbb;
}

.not-found {
  text-align: center;
  padding: 120px 0;
}

.not-found p {
  font-size: 18px;
  color: #999;
  margin-bottom: 20px;
}

.back-home-btn {
  padding: 10px 32px;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  cursor: pointer;
}
</style>