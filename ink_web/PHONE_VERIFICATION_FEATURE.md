# 电话验证功能实现文档

## 功能概述

重新引入基于GPS距离的电话号码后4位验证功能，作为可选的试点功能用于高价值客户。

## 验证流程

### 1. 用户点击NFC标签
- 获取用户当前GPS位置
- 发送验证请求到后端

### 2. 后端验证逻辑

#### 情况1: 距离 ≤ 100米
```
✅ 自动通过
- gps_verdict: "pass"
- phone_verified: false
- 直接完成验证，无需电话验证
```

#### 情况2: 距离 > 100米 && 数据库有customer_phone_last4
```
📱 需要电话验证
- 返回 requires_phone: true
- 前端跳转到电话验证页面
- 用户输入电话后4位
- 验证通过后完成投递确认
```

#### 情况3: 距离 > 100米 && 数据库没有customer_phone_last4
```
✅ 直接通过（无电话可验证）
- gps_verdict: "near" 或 "flagged"
- phone_verified: false
- 记录GPS判定结果但不强制验证
```

## 文件修改清单

### 前端 (ink_web)

#### 1. 新增文件
- `src/pages/PhoneVerification.tsx` - 电话验证页面
  - 4个输入框用于输入电话后4位
  - 自动聚焦和跳转
  - 错误显示和重试支持
  - 输入完成后自动提交验证

#### 2. 修改文件
- `src/App.tsx`
  - 添加路由: `/phone-verify/:token`
  
- `src/pages/Index.tsx`
  - 捕获 `requires_phone` 错误
  - 跳转到电话验证页面（带GPS坐标和设备信息）
  
- `src/lib/types.ts`
  - `VerifyRequest` 添加 `phone_last4?: string`
  - `VerifyResponse` 添加 `gps_verdict`, `phone_verified`, `distance_meters`
  - `VerifyErrorResponse` 添加 `requires_phone`, `distance_meters`

### 后端 (ink-firebase)

#### 修改文件
- `functions/routes/verify.js`
  - 引入 `calculateDistance` 和 `getGpsVerdict` 工具
  - 接收 `phone_last4` 参数
  - 计算GPS距离
  - 判断是否需要电话验证
  - 验证电话号码后4位
  - 保存 `gps_verdict` 和 `phone_verified` 到数据库
  - 返回距离和验证信息

## API 变更

### POST /verify

#### 请求参数
```json
{
  "nfc_token": "token_abc123",
  "delivery_gps": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "device_info": "iPhone 13",
  "phone_last4": "1234"  // 可选，当需要电话验证时提供
}
```

#### 成功响应 (200)
```json
{
  "proof_id": "proof_abc123",
  "verification_status": "verified",
  "signature": "...",
  "verify_url": "https://in.ink/verify/proof_abc123",
  "gps_verdict": "pass",
  "phone_verified": false,
  "distance_meters": 45
}
```

#### 需要电话验证 (400)
```json
{
  "error": "Phone verification required",
  "requires_phone": true,
  "distance_meters": 150
}
```

#### 电话验证失败 (403)
```json
{
  "error": "Phone verification failed",
  "requires_phone": true
}
```

## 数据库字段

### proofs 集合新增/更新字段
- `gps_verdict`: "pass" | "near" | "flagged"
- `phone_verified`: boolean
- `customer_phone_last4`: string (在 enroll 时已存在)

## 距离判定规则

| 距离范围 | GPS判定 | 需要电话验证 | 说明 |
|---------|---------|------------|------|
| ≤ 100米 | pass | ❌ 否 | 自动通过 |
| 100-300米 | near | ✅ 是* | 接近地址 |
| > 300米 | flagged | ✅ 是* | 标记异常 |

\* 仅当数据库有 `customer_phone_last4` 时需要验证

## 用户体验

### 正常流程（距离近）
1. 用户点击NFC
2. 获取位置
3. ✅ 直接显示"投递已确认"

### 需要验证流程（距离远 + 有电话）
1. 用户点击NFC
2. 获取位置
3. 📱 显示电话验证页面
4. 输入后4位数字
5. ✅ 显示"投递已确认"

### 错误处理
- 电话号码错误：显示错误消息，允许重新输入
- 网络错误：显示错误消息，可重试
- 自动聚焦第一个输入框
- 输入时自动跳转到下一个输入框
- 按退格键时自动回到上一个输入框

## 测试建议

### 1. 距离 ≤ 100米
- 直接通过，无需电话验证
- 检查 `gps_verdict: "pass"`

### 2. 距离 > 100米，有电话号码
- 应显示电话验证页面
- 输入正确后4位：验证成功
- 输入错误后4位：显示错误，可重试

### 3. 距离 > 100米，无电话号码
- 直接通过
- 检查 `gps_verdict: "near"` 或 `"flagged"`
- `phone_verified: false`

### 4. 已验证的订单
- 返回已存储的验证信息
- 不重复验证

## 部署注意事项

1. **后端部署**
   ```bash
   cd ink-firebase/functions
   firebase deploy --only functions
   ```

2. **前端部署**
   ```bash
   cd ink_web
   npm run build
   firebase deploy --only hosting
   ```

3. **数据库**
   - 现有字段已在 enroll 时设置
   - `gps_verdict` 和 `phone_verified` 会在首次验证时创建

## 安全考虑

- 电话号码后4位仅用于简单验证，不是强安全措施
- 适合作为额外的安全层，而非唯一的安全措施
- 验证失败允许重试，便于用户纠正输入错误
- GPS距离用于判断是否需要额外验证层级

## 未来改进

- 可考虑限制重试次数
- 可添加验证尝试的日志记录
- 可根据订单价值动态调整距离阈值
- 可在管理后台查看验证统计数据

