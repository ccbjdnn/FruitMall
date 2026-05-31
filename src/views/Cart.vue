<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const orderStore = useOrderStore()

const checkedItems = computed(() => cartStore.items.filter((i) => i.checked))

const checkedTotal = computed(() =>
  checkedItems.value.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2),
)

const isAllChecked = computed(() => cartStore.items.length > 0 && cartStore.items.every((i) => i.checked))

const toggleAll = () => {
  const target = !isAllChecked.value
  cartStore.items.forEach((i) => (i.checked = target))
}

const checkout = () => {
  if (checkedItems.value.length === 0) return
  if (!userStore.isLoggedIn) {
    router.push('/login?redirect=' + encodeURIComponent('/cart'))
    return
  }
  const total = parseFloat(checkedTotal.value)
  if (total <= 0) return

  const confirmed = window.confirm(
    `确认支付 ¥${total.toFixed(2)} 吗？\n共 ${checkedItems.value.length} 种商品，当前余额 ¥${userStore.balance.toFixed(2)}`,
  )
  if (!confirmed) return

  if (total > userStore.balance) {
    alert(`余额不足！需要 ¥${total.toFixed(2)}，当前余额 ¥${userStore.balance.toFixed(2)}`)
    return
  }
  const result = userStore.deductBalance(total)
  if (!result.success) {
    alert(result.error)
    return
  }
  orderStore.addOrder(checkedItems.value, total)
  alert(`支付成功！已从余额扣除 ¥${total.toFixed(2)}，剩余 ¥${userStore.balance.toFixed(2)}`)
  const ids = checkedItems.value.map((i) => i.cartId)
  ids.forEach((id) => cartStore.removeItem(id))
}
</script>

<template>
  <div class="cart-page">
    <header class="cart-header">
      <router-link to="/" class="back-btn">←</router-link>
      <h1>购物车</h1>
      <span v-if="cartStore.totalCount" class="header-count">{{ cartStore.totalCount }}件</span>
    </header>

    <!-- Empty cart -->
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <div class="empty-icon">🛒</div>
      <p>购物车是空的</p>
      <router-link to="/" class="go-shopping">去逛逛</router-link>
    </div>

    <template v-else>
      <!-- Balance display (logged in) -->
      <div v-if="userStore.isLoggedIn" class="balance-bar">
        <span class="balance-label">💰 余额</span>
        <span class="balance-amount">¥{{ userStore.balance.toFixed(2) }}</span>
      </div>

      <!-- Cart list -->
      <div class="cart-list">
        <div v-for="item in cartStore.items" :key="item.cartId" class="cart-item">
          <span class="check-box" :class="{ checked: item.checked }" @click="cartStore.toggleCheck(item.cartId)">
            {{ item.checked ? '✅' : '⭕' }}
          </span>
          <div class="item-image">
            <span class="cart-emoji-display">{{ item.image }}</span>
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-price">{{ item.specLabel }} · ¥{{ item.price }}</p>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" @click="cartStore.decrease(item.cartId)">−</button>
            <span class="qty-num">{{ item.quantity }}</span>
            <button class="qty-btn" @click="cartStore.increase(item.cartId)">+</button>
          </div>
          <span class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="cart-bottom">
        <div class="bottom-left" @click="toggleAll">
          <span class="check-box" :class="{ checked: isAllChecked }">
            {{ isAllChecked ? '✅' : '⭕' }}
          </span>
          <span class="all-text">全选</span>
        </div>
        <div class="bottom-right">
          <div class="total-info">
            <span class="total-label">合计:</span>
            <span class="total-price">¥{{ checkedTotal }}</span>
          </div>
          <button class="checkout-btn" :disabled="checkedItems.length === 0" @click="checkout">结算</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 100px;
}

.cart-header {
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
  color: #fff;
  text-decoration: none;
  font-size: 20px;
  margin-right: 12px;
}

.cart-header h1 {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
}

.header-count {
  font-size: 13px;
  opacity: 0.9;
}

.empty-cart {
  text-align: center;
  padding: 100px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-cart p {
  font-size: 16px;
  color: #999;
  margin-bottom: 20px;
}

.go-shopping {
  display: inline-block;
  padding: 10px 32px;
  background: #ff6b6b;
  color: #fff;
  border-radius: 24px;
  text-decoration: none;
  font-size: 14px;
}

.balance-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff8e1, #fff3cd);
  border-radius: 10px;
  border: 1px solid #ffe082;
}

.balance-label {
  font-size: 14px;
  color: #795548;
  font-weight: 500;
}

.balance-amount {
  font-size: 18px;
  font-weight: 700;
  color: #e65100;
}

.cart-list {
  padding: 0 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.check-box {
  font-size: 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-right: 8px;
}

.item-image {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #fff5f5, #fff8f0);
}

.cart-emoji-display {
  font-size: 32px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.item-info {
  flex: 1;
  margin-left: 10px;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.item-price {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.qty-btn {
  width: 26px;
  height: 26px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
}

.qty-num {
  width: 28px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

.item-subtotal {
  font-size: 14px;
  font-weight: 700;
  color: #ff6b6b;
  margin-left: 10px;
  flex-shrink: 0;
  min-width: 50px;
  text-align: right;
}

.cart-bottom {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 12px 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.bottom-left {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.all-text {
  font-size: 14px;
  color: #555;
}

.bottom-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.total-label {
  font-size: 13px;
  color: #555;
}

.total-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff6b6b;
}

.checkout-btn {
  padding: 8px 24px;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.checkout-btn:disabled {
  background: #ddd;
  color: #999;
  cursor: not-allowed;
}
</style>