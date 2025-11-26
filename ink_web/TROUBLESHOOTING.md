# 故障排除指南

## 路由访问问题

### 问题：访问 `https://inink-c76d3.web.app/t/token_xxx` 无法访问

#### 1. 检查 URL 拼写
确保 URL 正确：
- ✅ 正确：`https://inink-c76d3.web.app/t/token_xxx`
- ❌ 错误：`https://inink-c76d3.web.appt/t/token_xxx`（注意 `web.appt` 应该是 `web.app`）

#### 2. 确认部署状态
检查是否已正确部署：
```bash
cd ink_web
firebase hosting:channel:list
```

#### 3. 重新部署
如果配置有更新，需要重新部署：
```bash
cd ink_web
npm run build
firebase deploy --only hosting
```

#### 4. 检查路由配置
确保 `src/App.tsx` 中有正确的路由：
```typescript
<Route path="/t/:token" element={<Index />} />
```

#### 5. 检查 Firebase Hosting 配置
确保 `firebase.json` 中有正确的 rewrites：
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### 6. 清除浏览器缓存
有时浏览器缓存可能导致问题：
- 按 `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac) 强制刷新
- 或在开发者工具中清除缓存

#### 7. 检查浏览器控制台
打开浏览器开发者工具（F12），查看：
- Console 标签页是否有错误
- Network 标签页查看请求是否成功

#### 8. 测试步骤
1. 先访问首页：`https://inink-c76d3.web.app`
2. 如果首页可以访问，再测试路由：`https://inink-c76d3.web.app/t/test_token`
3. 检查 Network 标签，看是否有 404 错误

## 常见错误

### 错误：404 Not Found
**原因**：路由配置或 Firebase Hosting rewrites 配置不正确
**解决**：检查 `firebase.json` 和 `App.tsx` 中的路由配置

### 错误：空白页面
**原因**：JavaScript 加载失败或路由未正确初始化
**解决**：
1. 检查浏览器控制台错误
2. 确认所有静态资源路径正确
3. 检查 `vite.config.ts` 中的 `base` 配置

### 错误：API 请求失败
**原因**：CORS 或 API URL 配置错误
**解决**：
1. 检查 `src/lib/config.ts` 中的 API URL
2. 确认后端 CORS 配置允许你的域名
3. 检查浏览器 Network 标签中的请求详情

## 验证部署

### 检查部署状态
```bash
firebase hosting:sites:list
```

### 查看部署历史
```bash
firebase hosting:clone <site-id>
```

### 测试本地构建
```bash
npm run build
npm run preview
```
然后在浏览器访问 `http://localhost:4173/t/test_token` 测试路由

## 联系支持

如果以上步骤都无法解决问题，请提供：
1. 浏览器控制台的错误信息
2. Network 标签中的请求详情
3. 完整的错误 URL
4. 部署日志

