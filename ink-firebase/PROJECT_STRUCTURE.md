# 项目结构说明

## 目录结构

```
ink-firebase/
├── .firebaserc                 # Firebase项目配置（项目ID: ink-nfs）
├── .gitignore                  # Git忽略文件
├── firebase.json               # Firebase配置文件（Functions、Firestore、模拟器）
├── firestore.rules             # Firestore安全规则
├── firestore.indexes.json      # Firestore索引配置
├── README.md                   # 项目说明文档
├── QUICK_START.md             # 快速启动指南
├── PROJECT_STRUCTURE.md        # 本文件
├── start-emulator.ps1          # PowerShell启动脚本
│
└── functions/                  # Firebase Functions代码
    ├── .env                    # 环境变量（包含密钥）
    ├── package.json            # Functions依赖配置
    ├── index.js                # Functions入口（导出API函数）
    ├── app.js                  # Express应用主文件
    │
    ├── config/                 # 配置文件
    │   └── database.js         # Firestore数据库配置
    │
    ├── routes/                 # API路由
    │   ├── enroll.js           # POST /enroll - 注册包裹
    │   ├── verify.js            # POST /verify - 验证交付
    │   ├── retrieve.js          # GET /retrieve/:proofId - 检索证明
    │   └── jwks.js              # GET /.well-known/jwks.json - 公钥
    │
    └── utils/                  # 工具函数
        ├── crypto.js            # Ed25519签名和HMAC
        ├── gps.js               # GPS距离计算
        ├── id-generator.js      # 生成proof_id
        └── webhook.js           # Shopify webhook发送
```

## 关键文件说明

### Firebase配置

- **.firebaserc**: 指定Firebase项目ID为 `ink-nfs`
- **firebase.json**: 
  - Functions配置（源代码目录：functions）
  - Firestore规则和索引配置
  - 模拟器配置（Functions: 5001, Firestore: 8080, UI: 4000）

### Functions代码

- **index.js**: 
  - 初始化Firebase Admin
  - 导出Express应用为Firebase Function
  - 函数名称：`api`，区域：`us-central1`

- **app.js**: 
  - Express应用配置
  - 中间件设置（CORS、Helmet、限流）
  - 路由注册
  - 日志记录

### 环境变量

`.env` 文件包含：
- `ED25519_PRIVATE_KEY`: Ed25519私钥（用于签名）
- `ED25519_PUBLIC_KEY`: Ed25519公钥
- `SHOPIFY_WEBHOOK_URL`: Shopify webhook URL（可选）
- `HMAC_SECRET`: HMAC密钥（可选）
- `NODE_ENV`: 环境模式（development/production）

## API端点

所有API端点通过Firebase Function提供：

基础URL: `http://localhost:5001/ink-nfs/us-central1/api`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| POST | `/enroll` | 注册包裹 |
| POST | `/verify` | 验证交付 |
| GET | `/retrieve/:proofId` | 检索证明 |
| GET | `/.well-known/jwks.json` | 获取公钥 |

## 数据模型

### Firestore集合：`proofs`

```javascript
{
  proof_id: string,
  order_id: string,
  nfc_uid: string,
  nfc_token: string,
  enrollment_timestamp: timestamp,
  shipping_address_gps: { lat: number, lng: number },
  warehouse_gps: { lat: number, lng: number },
  photo_urls: string[],
  photo_hashes: string[],
  customer_phone_last4: string,
  delivery_timestamp: timestamp | null,
  delivery_gps: { lat: number, lng: number } | null,
  device_info: string | null,
  gps_verdict: 'pass' | 'near' | 'flagged' | null,
  phone_verified: boolean,
  signature: string,
  key_id: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

## 与原项目的区别

1. **部署方式**: 从独立Express服务器改为Firebase Functions
2. **数据库连接**: Firebase Admin自动初始化，无需手动配置服务账号路径
3. **环境变量**: 使用`.env`文件（本地）或Firebase配置（生产）
4. **URL路径**: API路径包含项目ID和区域前缀
5. **模拟器**: 使用Firebase模拟器进行本地开发

## 下一步

1. 安装依赖：`cd functions && npm install`
2. 启动模拟器：`firebase emulators:start`
3. 测试API端点
4. 查看Firebase UI：http://localhost:4000

