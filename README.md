# 🍉 鲜果时光 (FruitMall)

一个基于 **Vue 3 + Vite + Pinia** 构建的移动端水果商城应用，集成 **AI 智能水果顾问** 功能。

## ✨ 功能概览

- 🏠 **首页** — 热门水果展示，按分类浏览
- 🔍 **水果详情** — 查看水果详情，选择规格，加入购物车
- 👨‍🍳 **商家页** — 商家信息、分类筛选、商品列表
- 🛒 **购物车** — 商品勾选、数量增减、余额支付
- 👤 **个人中心** — 用户注册/登录、头像编辑（emoji 或图片上传）、个人信息管理
- 📋 **购买历史** — 订单记录持久化存储，查看历史消费明细
- 💰 **余额系统** — 注册即送余额，支付自动扣款
- 🍎 **AI 水果顾问** — 智能推荐水果、解答营养问题、提供饮食搭配建议、支持流式输出

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
| AI 后端    | Vercel Serverless Functions   |
| AI API     | DeepSeek Chat Completions     |

## 📁 项目结构

```
FruitMall/
├── api/
│   ├── chat.js                  # 普通聊天 API（Vercel Function）
│   └── chat/
│       └── stream.js            # 流式聊天 API（SSE）
├── public/
├── src/
│   ├── api/
│   │   └── ai.js                # 前端 AI API 客户端
│   ├── data/
│   │   └── fruits.js            # 水果 & 商家数据
│   ├── router/
│   │   └── index.js             # 路由配置
│   ├── stores/
│   │   ├── cart.js              # 购物车 Store
│   │   ├── user.js              # 用户 Store（登录/注册/余额）
│   │   └── order.js             # 订单 Store（购买历史）
│   ├── views/
│   │   ├── Home.vue             # 首页
│   │   ├── FruitDetail.vue      # 水果详情
│   │   ├── Merchant.vue         # 商家页
│   │   ├── Cart.vue             # 购物车
│   │   ├── Login.vue            # 登录
│   │   ├── Register.vue         # 注册
│   │   ├── Profile.vue          # 个人中心
│   │   └── AIChat.vue           # AI 水果顾问聊天页
│   ├── App.vue                  # 根组件 + 底部 Tab
│   └── main.js                  # 入口文件
├── .env.example                 # 环境变量示例
├── .gitignore                   # Git 忽略规则
├── vercel.json                  # Vercel 部署配置
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚀 本地运行

### 1. 安装依赖

```bash
cd FruitMall
npm install
```

### 2. 配置环境变量

复制环境变量示例文件，并填入你的 DeepSeek API Key：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> 获取 API Key：前往 [DeepSeek 开放平台](https://platform.deepseek.com) 注册并创建 API Key。

### 3. 启动 Vercel Functions 本地模拟

安装 Vercel CLI（如未安装）：

```bash
npm install -g vercel
```

在项目根目录启动本地模拟环境：

```bash
vercel dev
```

Vercel Dev 会自动读取 `.env` 中的环境变量，并在 `http://localhost:3000` 启动包含 Serverless Functions 的本地服务器。

### 4. 启动 Vite 前端开发服务器

在另一个终端中运行：

```bash
npm run dev
```

Vite 会在 `http://localhost:5173` 启动前端服务。

> **开发代理说明**：`vite.config.js` 中已配置代理规则，前端 `/api/*` 请求会自动转发到 `http://localhost:3000/api/*`（Vercel Functions 本地模拟端口）。

### 5. 访问应用

打开浏览器访问：**`http://localhost:5173`**

点击底部导航栏的 **🍎 水果顾问** 即可与 AI 对话。

---

## 📱 页面路由

| 路径            | 页面         | 说明               |
| --------------- | ------------ | ------------------ |
| `/`             | 首页         | 热门水果 & 分类    |
| `/fruit/:id`    | 水果详情     | 商品详情 & 加购    |
| `/merchant/:id` | 商家页       | 商家信息 & 商品    |
| `/cart`         | 购物车       | 勾选结算           |
| `/ai`           | 水果顾问     | AI 智能推荐 & 问答 |
| `/login`        | 登录         | 账号密码登录       |
| `/register`     | 注册         | 新用户注册         |
| `/profile`      | 个人中心     | 资料 / 购买历史    |

---

## ☁️ Vercel 部署

### 1. 安装 Vercel CLI（如未安装）

```bash
npm install -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

### 3. 部署项目

```bash
cd FruitMall
vercel --prod
```

按照提示完成部署配置。

### 4. 配置环境变量

在 Vercel Dashboard 中，进入你的项目，在 **Settings → Environment Variables** 中添加：

| 名称              | 值                          |
| ----------------- | --------------------------- |
| `DEEPSEEK_API_KEY` | 你的 DeepSeek API Key       |

> 生产环境使用 **System Environment Variables**，避免暴露在代码中。

### 5. 重新部署（使环境变量生效）

```bash
vercel --prod
```

部署完成后，访问 Vercel 提供的域名即可使用完整的 AI 水果顾问功能。

---

## 🔧 API 接口说明

### POST /api/chat

普通聊天请求（非流式）。

**请求体：**

```json
{
  "messages": [
    { "role": "user", "content": "减肥适合吃什么水果" }
  ]
}
```

**成功响应：**

```json
{
  "success": true,
  "reply": "AI 回复内容"
}
```

**错误响应：**

```json
{
  "success": false,
  "message": "错误描述"
}
```

### POST /api/chat/stream

流式聊天请求（SSE - Server-Sent Events）。

请求格式同上，响应使用 SSE 协议逐字返回内容。兼容 Vue3 前端 EventSource 接入。

---

## 🔒 安全说明

- API Key 通过环境变量 `process.env.DEEPSEEK_API_KEY` 读取，**不会被前端访问**。
- `.env`、`.env.local`、`.env.production` 已添加到 `.gitignore`，不会被提交到 Git。
- 使用 `.env.example` 提供环境变量模板（不含真实密钥）。
- API 接口实现了基于 IP 的简单限流（每 IP 每分钟 20 次请求，超出返回 429）。

---

## 🧪 AI 水果顾问功能说明

用户可以咨询：

-   减肥适合吃什么水果
-   健身吃什么水果
-   补充维生素C吃什么水果
-   哪些水果糖分低
-   哪些水果适合老人
-   哪些水果适合儿童

AI 会根据水果知识进行专业回答，回答简洁友好。如果用户咨询与水果无关的话题，AI 会礼貌引导回水果相关内容。

---

## 🔧 数据说明

- **水果 & 商家数据**：所有商品和商家信息位于 `src/data/fruits.js`，可在此文件中增删改数据。
- **用户数据**：注册信息、头像、余额等通过 Pinia + localStorage 持久化存储。
- **订单数据**：支付成功后自动创建订单，存储在 localStorage 中，`/profile` 页面可查看购买历史。
- **水果图片**：使用 emoji 表情（如 🍎🍊🍇）展示，无需外部图片资源。