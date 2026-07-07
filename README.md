# Chiaroscuro

Chiaroscuro 是一个围绕摄影作品管理、展示与 AI 辅助创作的全栈项目。项目分为前端和后端两部分：前端负责作品浏览、地图足迹、照片详情、作品集和 AI 页面；后端负责照片、作品集、AI 能力、对象存储和数据库管理。

## 项目特点

- 照片管理：支持草稿、详情、编辑、删除、移动和复制到作品集。
- 作品集管理：支持作品集的创建、更新、删除和详情查看。
- 足迹地图：按地区聚合照片，用地图展示拍摄轨迹和地域分布。
- AI 辅助：提供图像构图分析、灵感生成和多轮迭代优化能力。
- 云存储：接入腾讯云 COS，用于图片上传与资源管理。

## 技术栈

- 前端：Vue 3、Vue Router、Vite、Axios、Three.js
- 后端：Node.js、Express、Mongoose、MongoDB
- 其他：Tencent COS、Multer、EXIF 解析、AI 接口

## 目录结构

```text
e:\chiaroscuro
├── server        # 后端服务
└── web           # 前端应用
```

## 本地运行

### 1. 启动 MongoDB

项目后端依赖本地 MongoDB。请先确保 MongoDB 已启动。

### 2. 启动后端

```bash
cd server
npm install
npm run dev
```

默认会监听 `http://localhost:3000`。

### 3. 启动前端

```bash
cd web
npm install
npm run dev
```

Vite 默认会在终端输出本地访问地址。

## 环境变量

后端会读取 `.env` 文件中的配置，常见字段如下：

- `MONGO_URI`：MongoDB 连接地址
- `PORT`：后端服务端口，默认 `3000`
- `COS_SECRET_ID`：腾讯云 COS SecretId
- `COS_SECRET_KEY`：腾讯云 COS SecretKey

如果你还要使用 AI、上传或云存储相关能力，请根据后端代码和接口配置补齐对应环境变量。

## 主要页面

- `/`：首页
- `/archive`：归档页
- `/console`：控制台
- `/footprints`：足迹地图
- `/notes`：笔记与 AI 辅助页
- `/gallery-detail/:id`：画廊详情
- `/photo-detail/:id`：照片详情
- `/photo-desk/:mapCode`：地区照片列表
- `/postcards`：明信片页
- `/console/work/:id`：作品集详情

## 后端接口概览

后端接口主要分为四类：

- `api/photos`：照片查询、编辑、上传、删除
- `api/works`：作品集管理
- `api/ai`：AI 生成与分析
- `api/cos`：对象存储相关能力

详细接口说明可以参考 `server/API.md`。

## 说明

- 前后端是分开启动的。
- 如果接口请求失败，优先检查 MongoDB、`.env` 配置和后端日志。
- 前端页面和路由已经按业务场景拆分，适合继续扩展照片管理和创作能力。