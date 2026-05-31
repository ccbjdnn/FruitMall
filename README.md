# 🍉 鲜果时光 (FruitMall)

一个基于 **Vue 3 + Vite + Pinia** 构建的移动端水果商城应用。

## ✨ 功能概览

- 🏠 **首页** — 热门水果展示，按分类浏览
- 🔍 **水果详情** — 查看水果详情，选择规格，加入购物车
- 👨‍🍳 **商家页** — 商家信息、分类筛选、商品列表
- 🛒 **购物车** — 商品勾选、数量增减、余额支付
- 👤 **个人中心** — 用户注册/登录、头像编辑（emoji 或图片上传）、个人信息管理
- 📋 **购买历史** — 订单记录持久化存储，查看历史消费明细
- 💰 **余额系统** — 注册即送余额，支付自动扣款

## 🛠 技术栈

| 类别       | 技术                          |
| ---------- | ----------------------------- |
| 框架       | Vue 3 (Composition API)       |
| 构建工具   | Vite                          |
| 路由       | Vue Router 4                  |
| 状态管理   | Pinia                         |
| 数据持久化 | localStorage                  |
| 样式       | Scoped CSS + CSS Variables    |
| 移动适配   | 响应式布局，底部 Tab 导航     |

## 📁 项目结构

```
FruitMall/
├── public/
├── src/
│   ├── data/
│   │   └── fruits.js          # 水果 & 商家数据
│   ├── router/
│   │   └── index.js           # 路由配置
│   ├── stores/
│   │   ├── cart.js            # 购物车 Store
│   │   ├── user.js            # 用户 Store（登录/注册/余额）
│   │   └── order.js           # 订单 Store（购买历史）
│   ├── views/
│   │   ├── Home.vue           # 首页
│   │   ├── FruitDetail.vue    # 水果详情
│   │   ├── Merchant.vue       # 商家页
│   │   ├── Cart.vue           # 购物车
│   │   ├── Login.vue          # 登录
│   │   ├── Register.vue       # 注册
│   │   └── Profile.vue        # 个人中心
│   ├── App.vue                # 根组件 + 底部 Tab
│   └── main.js                # 入口文件
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build
```

## 📱 页面路由

| 路径            | 页面         | 说明               |
| --------------- | ------------ | ------------------ |
| `/`             | 首页         | 热门水果 & 分类    |
| `/fruit/:id`    | 水果详情     | 商品详情 & 加购    |
| `/merchant/:id` | 商家页       | 商家信息 & 商品    |
| `/cart`         | 购物车       | 勾选结算           |
| `/login`        | 登录         | 账号密码登录       |
| `/register`     | 注册         | 新用户注册         |
| `/profile`      | 个人中心     | 资料 / 购买历史    |

## 🔧 数据说明

- **水果 & 商家数据**：所有商品和商家信息位于 `src/data/fruits.js`，可在此文件中增删改数据。
- **用户数据**：注册信息、头像、余额等通过 Pinia + localStorage 持久化存储。
- **订单数据**：支付成功后自动创建订单，存储在 localStorage 中，`/profile` 页面可查看购买历史。
- **水果图片**：使用 emoji 表情（如 🍎🍊🍇）展示，无需外部图片资源。