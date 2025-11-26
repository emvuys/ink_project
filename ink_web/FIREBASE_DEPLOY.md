# Firebase Hosting 部署指南

## 前置要求

1. 安装 Firebase CLI：
```bash
npm install -g firebase-tools
```

2. 登录 Firebase：
```bash
firebase login
```

## 部署步骤

### 1. 构建项目

```bash
cd ink_web
npm run build
```

这会生成 `dist/` 目录，包含所有构建后的文件。

### 2. 部署到 Firebase Hosting

```bash
firebase deploy --only hosting
```

### 3. 查看部署结果

部署成功后，Firebase 会显示你的网站 URL，通常是：
```
https://inink-c76d3.web.app
```
或
```
https://inink-c76d3.firebaseapp.com
```

## 自定义域名

如果你想使用自定义域名（如 `in.ink`）：

1. 在 Firebase Console 中：
   - 进入 Hosting 页面
   - 点击 "Add custom domain"
   - 输入你的域名

2. 配置 DNS：
   - 按照 Firebase 提供的 DNS 记录配置你的域名
   - 通常需要添加 A 记录或 CNAME 记录

3. 等待 SSL 证书自动配置（通常几分钟）

## 环境变量配置

确保生产环境的 API URL 正确配置：

创建 `.env.production` 文件：
```
VITE_API_BASE_URL=https://us-central1-inink-c76d3.cloudfunctions.net/api
```

然后重新构建：
```bash
npm run build
firebase deploy --only hosting
```

## 快速部署脚本

可以在 `package.json` 中添加部署脚本：

```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy --only hosting"
  }
}
```

然后使用：
```bash
npm run deploy
```

## 预览部署

在部署前，可以先预览：

```bash
firebase hosting:channel:deploy preview
```

## 回滚部署

如果需要回滚到之前的版本：

```bash
firebase hosting:rollback
```

## 常见问题

### 问题：路由 404 错误

**解决方案**：确保 `firebase.json` 中有正确的 rewrites 配置（已包含在配置文件中）

### 问题：静态资源加载失败

**解决方案**：检查 `vite.config.ts` 中的 `base` 配置，确保路径正确

### 问题：API 请求失败

**解决方案**：
1. 检查 `.env.production` 中的 API URL
2. 确保后端 CORS 配置允许你的域名
3. 检查浏览器控制台的错误信息

## 持续部署

可以设置 GitHub Actions 或其他 CI/CD 工具自动部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: inink-c76d3
```

