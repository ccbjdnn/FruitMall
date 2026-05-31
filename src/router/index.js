import { createRouter,createMemoryHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { title: '购物车' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心' },
  },
  {
    path: '/fruit/:id',
    name: 'FruitDetail',
    component: () => import('@/views/FruitDetail.vue'),
    meta: { title: '商品详情' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/merchant/:name',
    name: 'Merchant',
    component: () => import('@/views/Merchant.vue'),
    meta: { title: '商家详情' },
  },
  {
    path: '/ai',
    name: 'AIChat',
    component: () => import('@/views/AIChat.vue'),
    meta: { title: '水果顾问' },
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router