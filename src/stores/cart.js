import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

let uidCounter = 0

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  )

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

  function removeItem(cartId) {
    items.value = items.value.filter((i) => i.cartId !== cartId)
  }

  function increase(cartId) {
    const item = items.value.find((i) => i.cartId === cartId)
    if (item) item.quantity++
  }

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

  function toggleCheck(cartId) {
    const item = items.value.find((i) => i.cartId === cartId)
    if (item) item.checked = !item.checked
  }

  function clearCart() {
    items.value = []
  }

  return { items, totalCount, totalPrice, addItem, removeItem, increase, decrease, toggleCheck, clearCart }
})
