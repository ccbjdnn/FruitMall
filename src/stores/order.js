import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const ORDERS_KEY = 'fruitmall_orders'

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []
  } catch {
    return []
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref(loadOrders())

  const totalOrderCount = computed(() => orders.value.length)

  const totalSpent = computed(() =>
    orders.value.reduce((sum, o) => sum + o.totalAmount, 0),
  )

  const recentOrders = computed(() =>
    [...orders.value].reverse(),
  )

  function addOrder(items, totalAmount) {
    const order = {
      id: 'ORD' + Date.now().toString(36).toUpperCase(),
      items: items.map((i) => ({
        name: i.name,
        image: i.image || i.emoji,
        specLabel: i.specLabel,
        price: i.price,
        quantity: i.quantity,
        fruitId: i.id,
      })),
      totalAmount,
      createdAt: new Date().toISOString(),
      itemCount: items.length,
    }
    orders.value.push(order)
    saveOrders(orders.value)
    return order
  }

  function clearOrders() {
    orders.value = []
    saveOrders(orders.value)
  }

  return {
    orders,
    totalOrderCount,
    totalSpent,
    recentOrders,
    addOrder,
    clearOrders,
  }
})