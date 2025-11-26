# INK NFS Firebase Project

这是移植到Firebase的INK NFS后端项目，使用Firebase Functions和Firestore。

## 项目结构

```
ink-firebase/
├── functions/              # Firebase Functions代码
│   ├── config/            # 配置文件
│   ├── routes/            # API路由
│   ├── utils/             # 工具函数
│   ├── index.js           # Functions入口
│   ├── app.js             # Express应用
│   └── package.json       # Functions依赖
├── firestore.rules        # Firestore安全规则
├── firestore.indexes.json # Firestore索引配置
├── firebase.json          # Firebase配置
└── .firebaserc            # Firebase项目配置
```

## 快速开始

### 1. 安装依赖

```bash
cd functions
npm install
```

### 2. 配置环境变量

在 `functions/.env` 文件中配置必要的环境变量（已从原项目复制）。

### 3. 启动Firebase模拟器

```bash
# 在项目根目录
firebase emulators:start
```

这将启动：
- Functions模拟器: http://localhost:5001
- Firestore模拟器: http://localhost:8080
- Firebase UI: http://localhost:4000

### 4. 测试API

API端点将通过Firebase Functions提供：
- `http://localhost:5001/ink-nfs/us-central1/api/enroll` - 注册包裹
- `http://localhost:5001/ink-nfs/us-central1/api/verify` - 验证交付
- `http://localhost:5001/ink-nfs/us-central1/api/retrieve/:proofId` - 检索证明
- `http://localhost:5001/ink-nfs/us-central1/api/.well-known/jwks.json` - 公钥
- `http://localhost:5001/ink-nfs/us-central1/api/health` - 健康检查

## API端点

- `POST /enroll` - 在发货时注册包裹
- `POST /verify` - 客户点击NFC时验证交付
- `GET /retrieve/:proofId` - 检索证明记录
- `GET /.well-known/jwks.json` - 获取公钥
- `GET /health` - 健康检查

## Firebase项目配置

- **项目ID**: `ink-nfs`
- **Functions区域**: `us-central1` (默认)
- **Firestore**: 已配置模拟器

## 部署

### 部署到Firebase

```bash
# 部署Functions
firebase deploy --only functions

# 部署Firestore规则和索引
firebase deploy --only firestore
```

### 设置环境变量（生产环境）

```bash
firebase functions:config:set \
  ed25519.private_key="your_private_key" \
  ed25519.public_key="your_public_key" \
  shopify.webhook_url="your_webhook_url" \
  shopify.hmac_secret="your_hmac_secret"
```

## 技术栈

- Node.js + Express.js
- Firebase Functions
- Firebase Admin SDK
- Cloud Firestore
- Ed25519加密签名
- HMAC-SHA256 webhooks

## 开发说明

### 本地开发

1. 启动模拟器：`firebase emulators:start`
2. Functions会自动重新加载代码更改
3. 查看日志：在终端中查看，或访问Firebase UI

### 调试

- Functions日志：`firebase functions:log`
- Firestore数据：在Firebase UI中查看
- 本地测试：使用Postman或curl测试API端点

## 注意事项

1. **环境变量**: 在Firebase Functions中，环境变量通过`.env`文件（本地）或Firebase配置（生产）管理
2. **Firestore**: 模拟器使用本地数据，不会影响生产数据库
3. **认证**: 当前配置允许公开读取proofs集合，生产环境需要添加认证

firebase deploy --only functions


