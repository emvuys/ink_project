# 快速启动指南

## 前置要求

1. 安装Node.js (v18或更高版本)
2. 安装Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
3. 登录Firebase:
   ```bash
   firebase login
   ```

## 安装步骤

### 1. 安装依赖

```bash
cd functions
npm install
cd ..
```

### 2. 启动Firebase模拟器

```bash
firebase emulators:start
```

这将启动：
- **Functions模拟器**: http://localhost:5001
- **Firestore模拟器**: http://localhost:8080  
- **Firebase UI**: http://localhost:4000

### 3. 测试API

API端点格式：
```
http://localhost:5001/ink-nfs/us-central1/api/{endpoint}
```

例如：
- 健康检查: `GET http://localhost:5001/ink-nfs/us-central1/api/health`
- 注册包裹: `POST http://localhost:5001/ink-nfs/us-central1/api/enroll`
- 验证交付: `POST http://localhost:5001/ink-nfs/us-central1/api/verify`
- 检索证明: `GET http://localhost:5001/ink-nfs/us-central1/api/retrieve/{proofId}`
- 获取公钥: `GET http://localhost:5001/ink-nfs/us-central1/api/.well-known/jwks.json`

## 使用curl测试

```bash
# 健康检查
curl http://localhost:5001/ink-nfs/us-central1/api/health

# 获取公钥
curl http://localhost:5001/ink-nfs/us-central1/api/.well-known/jwks.json
```

## 查看数据

访问Firebase UI: http://localhost:4000
- 可以查看Firestore数据
- 可以查看Functions日志
- 可以测试Functions

## 停止模拟器

按 `Ctrl+C` 停止模拟器

## 常见问题

### 端口被占用

如果端口被占用，可以修改 `firebase.json` 中的端口配置。

### Functions未启动

确保在项目根目录运行 `firebase emulators:start`，而不是在 `functions` 目录。

### 环境变量未加载

确保 `functions/.env` 文件存在且格式正确。

