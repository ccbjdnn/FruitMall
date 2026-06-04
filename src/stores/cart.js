import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

let uidCounter = 0

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  // 计算总数量和总价格
  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  )

  // 添加商品到购物车，如果已存在相同水果和规格则增加数量
  function addItem(fruit, qty = 1, spec = null) {
    const specObj = spec || fruit.specs?.[0] || { label: '', price: 0 }
    const specKey = specObj.label
    const existing = items.value.find((i) => i.id === fruit.id && i.specKey === specKey)
    if (existing) {
      existing.quantity += qty
    } else {
      items.value.push({
        ...fruit,
        cartId: ++uidCounter,
        quantity: qty,
        specKey,
        specLabel: specObj.label,
        price: specObj.price,
        checked: true,
      })
    }
  }

  // 根据 cartId 从购物车中移除商品
  function removeItem(cartId) {
    items.value = items.value.filter((i) => i.cartId !== cartId)
  }

  // 增加或减少购物车中商品的数量
  function increase(cartId) {
    const item = items.value.find((i) => i.cartId === cartId)
    if (item) item.quantity++
  }

  // 减少商品数量，如果数量为 1 则移除该商品
  function decrease(cartId) {
    const item = items.value.find((i) => i.cartId === cartId)
    if (item) {
      if (item.quantity > 1) {
        item.quantity--
      } else {
        removeItem(cartId)
      }
    }
  }

  // 切换商品的选中状态
  function toggleCheck(cartId) {
    const item = items.value.find((i) => i.cartId === cartId)
    if (item) item.checked = !item.checked
  }

  // 清空购物车
  function clearCart() {
    items.value = []
  }

  return { items, totalCount, totalPrice, addItem, removeItem, increase, decrease, toggleCheck, clearCart }
})
