# Record Page 新功能说明

## 更新日期
2025年1月4日

## 新增功能

### 1. 真实地图显示 🗺️

**功能描述：**
- 使用 OpenStreetMap 嵌入式地图显示真实的交付位置
- 地图上自动标记交付坐标
- 显示完整的 GPS 坐标（精确到小数点后6位）

**实现方式：**
```tsx
<iframe
  src={`https://www.openstreetmap.org/export/embed.html?bbox=...&marker=${lat},${lng}`}
  ...
/>
```

**显示内容：**
- 交互式地图（可缩放、平移）
- 红色标记点显示准确位置
- 地址文本显示
- GPS 坐标显示（例如：23.022500, 72.571400）

---

### 2. 专业 PDF 证书生成 📄

**功能描述：**
- 生成包含完整交付信息的专业 PDF 证书
- 包含所有验证细节和照片
- 适用于保修、保险、转售等场景

**PDF 内容结构：**

#### 页眉
- 标题："Authenticated Delivery Record"
- 副标题："Cryptographically verified proof of delivery"

#### 订单信息
- Merchant（商家）
- Order Number（订单号）
- Delivery Date（交付日期）
- Location（地址）

#### GPS 验证
- 原始坐标（精确到6位小数）
- 交付坐标（如果有）
- 地图链接

#### 技术验证细节
- NFC Tag ID
- Proof ID
- Signature（完整签名）

#### 包裹照片
- 4张照片（如果可用）
- 每张照片带标签：
  - Authentication Markers
  - Serial Number
  - Complete Contents
  - Packaging Condition

#### 页脚
- 生成时间
- "Powered by ink." 链接

**技术实现：**
- 使用 `jsPDF` 库生成 PDF
- 使用 `html2canvas` 处理图片
- 自动处理跨页
- 异步加载照片
- 错误处理（照片加载失败时显示占位符）

**文件命名：**
```
delivery-record-{order_id}.pdf
```
例如：`delivery-record-1008***008.pdf`

---

## 用户体验改进

### 地图功能
✅ 真实地图替代占位符  
✅ 自动居中到交付位置  
✅ 显示周边环境  
✅ 可交互（缩放、平移）  

### PDF 功能
✅ 一键下载  
✅ 专业格式  
✅ 包含所有关键信息  
✅ 适合打印和存档  
✅ 生成进度提示（"Generating PDF..."）  

---

## 技术栈

### 新增依赖
```json
{
  "jspdf": "^2.x.x",
  "html2canvas": "^1.x.x",
  "@types/jspdf": "^2.x.x"
}
```

### API 使用
- **OpenStreetMap Embed API**：免费，无需 API key
- **Nominatim Geocoding API**：反向地理编码

---

## 使用说明

### 查看地图
1. 访问 `/authenticated-delivery-record/:proofId`
2. 地图自动加载并显示交付位置
3. 可以在地图上缩放和平移查看周边

### 下载 PDF
1. 点击 "Download PDF Certificate" 按钮
2. 等待 PDF 生成（按钮显示 "Generating PDF..."）
3. PDF 自动下载到浏览器默认下载文件夹
4. 文件名：`delivery-record-{订单号}.pdf`

---

## 浏览器兼容性

### 地图功能
✅ Chrome/Edge  
✅ Firefox  
✅ Safari  
✅ 移动浏览器  

### PDF 功能
✅ Chrome/Edge（推荐）  
✅ Firefox  
⚠️ Safari（可能需要允许下载）  
✅ 移动浏览器  

---

## 注意事项

1. **地图加载**
   - 需要网络连接
   - 首次加载可能需要几秒钟
   - 如果地图无法加载，会显示占位符

2. **PDF 生成**
   - 包含照片时生成时间较长（5-10秒）
   - 照片加载失败时会显示占位文本
   - 大文件可能需要更多时间

3. **隐私**
   - GPS 坐标是公开的
   - PDF 包含完整的验证信息
   - 建议仅分享给需要的人

---

## 未来改进

- [ ] 支持 Google Maps 选项
- [ ] PDF 添加二维码（扫码验证）
- [ ] 支持多语言 PDF
- [ ] 添加水印防伪
- [ ] 支持自定义 PDF 模板

---

## 相关文件

- `INK_WEB/src/pages/Record.tsx` - 主要实现
- `INK_WEB/src/lib/geocoding.ts` - 地理编码
- `INK_WEB/src/lib/types.ts` - 类型定义

