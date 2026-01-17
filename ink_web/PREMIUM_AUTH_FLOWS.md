# Premium 和 Auth 双流程实现文档

## 🎯 功能概述

实现了两种投递验证流程：
- **Premium Delivery**: 高级投递，不需要电话验证
- **Ink Authenticate**: 认证投递，根据GPS距离可能需要电话验证

## 📐 URL结构

### Premium Flow (高级投递)
```
/premium/t/{token}                    → 验证处理 + GPS检测
/premium/email-sent?proofId={id}      → 投递确认页面（"Email Sent"）
/premium/delivery-record/{proofId}    → Premium投递记录（60天退货等）
```

### Auth Flow (认证投递)
```
/auth/t/{token}                       → 验证处理 + GPS检测
/auth/phone-verify/{token}?lat=&lng=  → 电话验证页面（如需要）
/auth/authenticated?proofId={id}      → 投递确认页面（"Verified"）
/auth/delivery-record/{proofId}       → Auth投递记录（带技术证明）
```

### 兼容旧URL
```
/t/{token}  → 使用 Auth 流程（向后兼容）
```

## 🔀 流程对比

### Premium Delivery 流程

```
用户点击NFC (Premium标签)
    ↓
GET /premium/t/{token}
    ↓
获取GPS位置
    ↓
POST /verify
{
  nfc_token: token,
  delivery_gps: {lat, lng},
  delivery_type: 'premium'
}
    ↓
后端计算距离
    ├─ ≤100m → 记录 gps_verdict: "pass"
    └─ >100m → 记录 gps_verdict: "near"/"flagged"
    
⚠️ 不需要电话验证（即使距离>100m）
    ↓
验证成功 → 发送webhook
    ↓
重定向到 /premium/email-sent?proofId={id}
    ↓
显示 "Delivery Confirmed" + "Email Sent"
    ↓
[View Record] → /premium/delivery-record/{proofId}
```

### Auth Flow (认证投递)

```
用户点击NFC (Auth标签)
    ↓
GET /auth/t/{token}
    ↓
获取GPS位置
    ↓
POST /verify
{
  nfc_token: token,
  delivery_gps: {lat, lng},
  delivery_type: 'authenticate'
}
    ↓
后端计算距离
    ├─ ≤100m → gps_verdict: "pass" → ✅ 直接通过
    │
    └─ >100m → 检查是否有customer_phone_last4?
         ├─ 没有 → gps_verdict: "near" → ✅ 直接通过
         │
         └─ 有 → 返回 requires_phone: true
              ↓
         重定向到 /auth/phone-verify/{token}?lat=&lng=
              ↓
         用户输入电话后4位
              ↓
         POST /verify (带 phone_last4)
              ├─ 验证成功 → phone_verified: true
              └─ 验证失败 → 显示错误，允许重试
    ↓
验证成功 → 发送webhook
    ↓
重定向到 /auth/authenticated?proofId={id}
    ↓
显示 "Delivery Confirmed" + "Verified"
    ↓
[View Proof] → /auth/delivery-record/{proofId}
```

## 🗂️ 文件结构

```
ink_web/src/
├── pages/
│   ├── premium/
│   │   ├── PremiumUnlockingHandler.tsx   // 处理验证逻辑
│   │   ├── Unlocking.tsx                  // 静态展示页面
│   │   ├── EmailSent.tsx                  // 成功页面
│   │   └── DeliveryRecord.tsx             // 投递记录
│   │
│   ├── auth/
│   │   ├── AuthUnlockingHandler.tsx       // 处理验证逻辑
│   │   ├── Unlocking.tsx                  // 静态展示页面
│   │   ├── PhoneVerificationHandler.tsx   // 电话验证处理
│   │   ├── PhoneVerification.tsx          // 静态展示页面
│   │   ├── Authenticated.tsx              // 成功页面
│   │   └── DeliveryRecord.tsx             // 投递记录
│   │
│   └── ... (其他共享页面)
│
└── lib/
    └── types.ts  // 添加了 delivery_type 字段

ink-firebase/functions/routes/
└── verify.js  // 支持 delivery_type 区分逻辑
```

## 🔧 后端逻辑变更

### verify.js 关键逻辑

```javascript
const isPremium = delivery_type === 'premium';

if (!isPremium && distance > 100 && proof.customer_phone_last4) {
  // Auth类型 + 距离>100m + 有电话号码 → 需要验证
  if (!phone_last4) {
    return res.status(400).json({
      error: 'Phone verification required',
      requires_phone: true,
      distance_meters: Math.round(distance)
    });
  }
  
  // 验证电话号码
  if (phone_last4 !== proof.customer_phone_last4) {
    return res.status(403).json({
      error: 'Phone verification failed',
      requires_phone: true
    });
  }
  
  phoneVerified = true;
} else if (isPremium) {
  // Premium类型 → 跳过电话验证
  console.log('[VERIFY] Premium delivery type - skipping phone verification');
}
```

## 📊 数据库字段

### proofs 集合
```javascript
{
  // 现有字段
  proof_id: "proof_abc123",
  order_id: "order_123",
  nfc_token: "token_xyz",
  customer_phone_last4: "1234",  // 可选，enroll时提供
  shipping_address_gps: {
    lat: 40.7128,
    lng: -74.0060
  },
  
  // 验证时更新的字段
  delivery_gps: {
    lat: 40.7129,
    lng: -74.0061
  },
  gps_verdict: "pass" | "near" | "flagged",
  phone_verified: true | false,
  delivery_timestamp: Timestamp,
  signature: "...",
  // ...其他字段
}
```

## 🔑 关键差异对比

| 特性 | Premium Delivery | Ink Authenticate |
|-----|-----------------|------------------|
| **URL前缀** | `/premium/` | `/auth/` |
| **电话验证** | ❌ 不需要 | ✅ 条件需要（距离>100m + 有电话） |
| **GPS距离判断** | ✅ 记录但不影响流程 | ✅ 用于判断是否需要电话验证 |
| **成功页面文案** | "Email Sent" | "Verified" |
| **按钮文字** | "View Record" | "View Proof" |
| **Record页面** | 60天退货政策 | 技术验证证明 |
| **Webhook发送** | ✅ 验证成功后 | ✅ 验证成功后 |

## 🎨 页面文案对比

### Premium: EmailSent页面
```
标题: "Delivery Confirmed"
副标题: "Thank you for choosing ink. Premium Shipping"
状态: "EMAIL SENT"
按钮: "View Record"
```

### Auth: Authenticated页面
```
标题: "Delivery Confirmed"
副标题: "Your delivery has been authenticated"
状态: "VERIFIED"
按钮: "View Proof"
```

## 🧪 测试场景

### Premium Delivery 测试

**场景1: 距离≤100米**
```
访问: /premium/t/{token}
GPS距离: 50米
预期: 直接成功 → /premium/email-sent
```

**场景2: 距离>100米**
```
访问: /premium/t/{token}
GPS距离: 250米
预期: 直接成功 → /premium/email-sent (不要求电话验证)
数据库: gps_verdict="near", phone_verified=false
```

### Auth Delivery 测试

**场景1: 距离≤100米**
```
访问: /auth/t/{token}
GPS距离: 50米
预期: 直接成功 → /auth/authenticated
数据库: gps_verdict="pass", phone_verified=false
```

**场景2: 距离>100米 + 有电话号码**
```
访问: /auth/t/{token}
GPS距离: 250米
数据库有: customer_phone_last4="1234"
预期: 跳转到 /auth/phone-verify/{token}?lat=...
输入: 1234
结果: 成功 → /auth/authenticated
数据库: gps_verdict="near", phone_verified=true
```

**场景3: 距离>100米 + 无电话号码**
```
访问: /auth/t/{token}
GPS距离: 250米
数据库: customer_phone_last4 为空
预期: 直接成功 → /auth/authenticated
数据库: gps_verdict="near", phone_verified=false
```

**场景4: 电话验证失败**
```
输入错误的后4位: 5678
预期: 显示错误 "Phone verification failed"
允许重新输入
```

## 📡 API 调用示例

### Premium Delivery 验证
```javascript
POST https://api.in.ink/verify
{
  "nfc_token": "token_premium_abc",
  "delivery_gps": {
    "lat": 40.7135,
    "lng": -74.0070
  },
  "device_info": "iPhone 13",
  "delivery_type": "premium"
}

// 响应 (距离>100m，但Premium不需要电话)
{
  "proof_id": "proof_xyz",
  "verification_status": "verified",
  "signature": "...",
  "verify_url": "https://in.ink/verify/proof_xyz",
  "gps_verdict": "near",
  "phone_verified": false,
  "distance_meters": 150
}
```

### Auth Delivery 验证（需要电话）
```javascript
// 第一次请求
POST https://api.in.ink/verify
{
  "nfc_token": "token_auth_abc",
  "delivery_gps": {
    "lat": 40.7135,
    "lng": -74.0070
  },
  "device_info": "iPhone 13",
  "delivery_type": "authenticate"
}

// 响应 (需要电话验证)
Status: 400
{
  "error": "Phone verification required",
  "requires_phone": true,
  "distance_meters": 150
}

// 第二次请求（带电话号码）
POST https://api.in.ink/verify
{
  "nfc_token": "token_auth_abc",
  "delivery_gps": {
    "lat": 40.7135,
    "lng": -74.0070
  },
  "device_info": "iPhone 13",
  "phone_last4": "1234",
  "delivery_type": "authenticate"
}

// 响应 (验证成功)
{
  "proof_id": "proof_xyz",
  "verification_status": "verified",
  "signature": "...",
  "verify_url": "https://in.ink/verify/proof_xyz",
  "gps_verdict": "near",
  "phone_verified": true,
  "distance_meters": 150
}
```

## 🚀 部署步骤

### 1. 后端部署
```bash
cd ink-firebase/functions
firebase deploy --only functions
```

### 2. 前端部署
```bash
cd ink_web
npm run build
firebase deploy --only hosting
```

### 3. 测试验证
- 测试 Premium 流程: 访问 `/premium/t/{test_token}`
- 测试 Auth 流程: 访问 `/auth/t/{test_token}`
- 测试旧URL兼容: 访问 `/t/{test_token}` → 应使用Auth流程

## ⚠️ 注意事项

1. **Webhook发送**: 两种类型都会在验证成功后发送webhook给Taimoor后端
2. **Email发送**: 由Taimoor后端处理，不需要在enroll时提供email字段
3. **GPS记录**: 无论哪种类型，都会记录GPS距离和判定结果
4. **向后兼容**: `/t/{token}` 路由保持使用Auth流程
5. **错误处理**: 所有验证失败都会跳转到 `/error` 页面

## 🔮 未来改进

- [ ] 在enroll时允许指定delivery_type
- [ ] 添加管理后台查看两种类型的统计数据
- [ ] 根据订单价值动态选择验证类型
- [ ] 支持更多验证类型（如生物识别）

## 📝 更新日志

### 2025-01-08
- ✅ 实现Premium和Auth双流程
- ✅ 复制并适配lovable项目的所有页面
- ✅ 更新后端支持delivery_type区分
- ✅ 保持向后兼容
- ✅ 完整的错误处理和重试机制

