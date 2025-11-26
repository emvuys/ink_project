# API测试指南

## OpenAPI规范文件

项目包含 `openapi.yaml` 文件，可用于API测试和文档生成。

## 服务器配置

OpenAPI规范中配置了以下服务器：

1. **Firebase Functions生产环境**
   - URL: `https://us-central1-ink-nfs.cloudfunctions.net/api`
   - 说明: 部署到Firebase后的生产环境

2. **Firebase Functions模拟器（本地开发）**
   - URL: `http://localhost:5001/ink-nfs/us-central1/api`
   - 说明: 本地Firebase模拟器，用于开发和测试

3. **旧版服务器（已弃用）**
   - 生产: `http://193.57.137.90:8000`
   - 本地: `http://localhost:8000`

## 使用OpenAPI文件测试

### 方法1: 使用Postman

1. 打开Postman
2. 点击 **Import** 按钮
3. 选择 **File** 标签
4. 选择 `openapi.yaml` 文件
5. 导入后，可以在Postman中看到所有API端点
6. 在右上角选择服务器（选择"Firebase Functions emulator"用于本地测试）
7. 点击 **Send** 测试API

### 方法2: 使用Swagger UI

1. 访问 [Swagger Editor](https://editor.swagger.io/)
2. 点击 **File** > **Import file**
3. 选择 `openapi.yaml` 文件
4. 在右上角选择服务器
5. 点击 **Try it out** 测试API

### 方法3: 使用VS Code扩展

1. 安装 **REST Client** 扩展
2. 安装 **OpenAPI (Swagger) Editor** 扩展
3. 打开 `openapi.yaml` 文件
4. 使用扩展功能测试API

### 方法4: 使用curl命令

```bash
# 健康检查
curl http://localhost:5001/ink-nfs/us-central1/api/health

# 获取公钥
curl http://localhost:5001/ink-nfs/us-central1/api/.well-known/jwks.json

# 注册包裹
curl -X POST http://localhost:5001/ink-nfs/us-central1/api/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORDER-12345",
    "nfc_uid": "04:1A:2B:3C:4D:5E:6F",
    "nfc_token": "token_test_abc123",
    "photo_urls": [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg",
      "https://example.com/photo3.jpg",
      "https://example.com/photo4.jpg"
    ],
    "photo_hashes": [
      "hash1234567890abcdef",
      "hash2234567890abcdef",
      "hash3234567890abcdef",
      "hash4234567890abcdef"
    ],
    "shipping_address_gps": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "customer_phone_last4": "1234",
    "warehouse_gps": {
      "lat": 40.7580,
      "lng": -73.9855
    }
  }'

# 验证交付（使用上面返回的proof_id和nfc_token）
curl -X POST http://localhost:5001/ink-nfs/us-central1/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "nfc_token": "token_test_abc123",
    "delivery_gps": {
      "lat": 40.7129,
      "lng": -74.0061
    },
    "device_info": "iPhone 14 Pro, iOS 17"
  }'

# 检索证明（使用enroll返回的proof_id）
curl http://localhost:5001/ink-nfs/us-central1/api/retrieve/{proofId}
```

## 测试流程

### 1. 启动Firebase模拟器

```bash
cd E:\upwork\ink-firebase
firebase emulators:start
```

### 2. 测试健康检查

```bash
curl http://localhost:5001/ink-nfs/us-central1/api/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 3. 测试注册端点

使用上面的curl命令或Postman发送POST请求到 `/enroll`

### 4. 测试验证端点

使用注册时返回的 `nfc_token` 测试 `/verify` 端点

### 5. 测试检索端点

使用注册时返回的 `proof_id` 测试 `/retrieve/{proofId}` 端点

## 注意事项

1. **URL路径**: Firebase Functions的URL包含项目ID和区域前缀
   - 格式: `http://localhost:5001/{project-id}/{region}/{function-name}/{endpoint}`
   - 示例: `http://localhost:5001/ink-nfs/us-central1/api/health`

2. **服务器选择**: 在测试工具中选择正确的服务器
   - 本地测试: 选择 "Firebase Functions emulator"
   - 生产测试: 选择 "Firebase Functions production server"

3. **CORS**: Firebase Functions默认启用CORS，可以直接从浏览器测试

4. **环境变量**: 确保 `functions/.env` 文件已正确配置

## 生成API文档

可以使用OpenAPI文件生成HTML文档：

```bash
# 使用redoc-cli
npm install -g redoc-cli
redoc-cli bundle openapi.yaml -o api-docs.html

# 或使用swagger-ui
npx swagger-ui-watcher openapi.yaml
```

## 故障排除

### 问题: 无法连接到服务器

- 确保Firebase模拟器正在运行
- 检查端口是否正确（5001）
- 检查URL路径是否包含项目ID和区域

### 问题: 404错误

- 检查函数名称是否正确（应该是 `api`）
- 检查端点路径是否正确
- 确保在项目根目录运行模拟器

### 问题: CORS错误

- Firebase Functions默认启用CORS
- 如果仍有问题，检查 `app.js` 中的CORS配置

