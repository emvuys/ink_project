# 后端API修改总结

## 修改文件

### `functions/routes/verify.js`

#### 移除的功能：
1. ❌ `phone_last4` 参数处理
2. ❌ GPS距离计算（用于判断是否需要手机号）
3. ❌ `getGpsVerdict()` 调用
4. ❌ 手机号验证逻辑（距离>100m的判断）
5. ❌ `requires_phone` 错误响应
6. ❌ `phone_verified` 字段更新

#### 保留的功能：
1. ✅ Token查找和验证
2. ✅ 已验证状态检查（`delivery_timestamp`）
3. ✅ GPS位置记录（`delivery_gps`）
4. ✅ 设备信息记录（`device_info`）
5. ✅ 签名生成和更新
6. ✅ Webhook发送
7. ✅ 数据库更新

#### 简化的响应：
**旧响应：**
```json
{
  "proof_id": "...",
  "verification_status": "verified",
  "gps_verdict": "pass",
  "distance_meters": 11,
  "signature": "...",
  "verify_url": "..."
}
```

**新响应：**
```json
{
  "proof_id": "...",
  "verification_status": "verified",
  "signature": "...",
  "verify_url": "...",
  "already_verified": true  // 如果已验证
}
```

#### 简化的请求：
**旧请求：**
```json
{
  "nfc_token": "...",
  "delivery_gps": {...},
  "device_info": "...",
  "phone_last4": "1234"  // 可选
}
```

**新请求：**
```json
{
  "nfc_token": "...",
  "delivery_gps": {...},
  "device_info": "..."  // 可选
}
```

---

## 未修改的文件

### `functions/routes/enroll.js`
- ✅ **保持不变** - 注册时仍需要 `customer_phone_last4`（用于存储，但不用于验证判断）

### `functions/utils/gps.js`
- ✅ **保留文件** - 虽然不再在verify中使用，但可能用于其他目的或历史数据

---

## 数据库字段变更

### 仍然存储的字段：
- ✅ `delivery_gps` - 交付GPS位置
- ✅ `device_info` - 设备信息
- ✅ `delivery_timestamp` - 交付时间戳
- ✅ `signature` - 签名

### 不再更新的字段：
- ❌ `gps_verdict` - 不再计算和更新
- ❌ `phone_verified` - 不再更新

**注意：** 历史数据中可能仍包含这些字段，但不影响新验证流程。

---

## API行为变更

### 验证流程：

**旧流程：**
1. 接收请求（token + GPS + 可选的手机号）
2. 查找token
3. 计算GPS距离
4. 如果距离>100m → 要求手机号
5. 验证手机号
6. 更新数据库
7. 返回结果

**新流程：**
1. 接收请求（token + GPS）
2. 查找token
3. 检查是否已验证
4. 如果已验证 → 返回已验证信息
5. 如果未验证 → 记录GPS位置 → 更新为已验证
6. 返回结果

---

## 错误响应变更

### 移除的错误：
- ❌ `400 Bad Request: Phone verification required` (with `requires_phone: true`)
- ❌ `403 Forbidden: Phone verification failed`

### 保留的错误：
- ✅ `400 Bad Request: Missing required fields`
- ✅ `404 Not Found: Invalid token`
- ✅ `500 Internal Server Error`

---

## Webhook变更

### 移除的字段：
- ❌ `gps_verdict` - 不再发送

### 保留的字段：
- ✅ `order_id`
- ✅ `status`
- ✅ `delivery_gps`
- ✅ `proof_ref`
- ✅ `timestamp`
- ✅ `verify_url`

---

## 测试要点

### 需要测试的场景：
1. ✅ 新token验证（未验证过）
2. ✅ 已验证token（返回已验证状态）
3. ✅ 无效token（404错误）
4. ✅ 缺少必需字段（400错误）
5. ✅ GPS位置正确记录
6. ✅ Webhook正确发送

### 不需要测试的场景：
- ❌ 手机号验证流程
- ❌ GPS距离判断
- ❌ 距离>100m的场景

---

## 部署注意事项

1. **向后兼容性**：
   - 前端已更新，不再发送 `phone_last4`
   - 后端不再处理 `phone_last4` 参数（忽略即可）

2. **数据库迁移**：
   - 不需要数据库迁移
   - 历史数据保持不变
   - 新验证不再更新 `gps_verdict` 和 `phone_verified`

3. **Webhook兼容性**：
   - 移除 `gps_verdict` 字段
   - 确保接收端能处理新的webhook格式

---

## 修改完成

**修改日期：** 2024年12月12日  
**修改状态：** ✅ 完成  
**测试状态：** ⏳ 待测试

