# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2024-08-11

### Added
- 🎉 **新增 UMD 格式支持**：现在可以通过 script 标签直接在浏览器中使用
- 📦 添加了 `dist/index.umd.js` 构建输出
- 🌐 支持通过 CDN 引入：`<script src="https://unpkg.com/bare-toast@latest/dist/index.umd.js"></script>`
- 📖 添加了完整的 script 标签使用示例和文档
- 🎯 创建了 `example.html` 演示文件，展示各种使用方式

### Changed
- 📝 更新了 README.md，添加了 script 标签引入的详细说明
- 📦 在 package.json 中添加了 `browser` 字段，指向 UMD 版本

### Technical Details
- 🔧 修改 rollup.config.js，添加 UMD 格式构建配置
- 🌍 UMD 版本通过全局变量 `BareToast` 暴露，支持 `BareToast.default` 和 `BareToast.toast` 两种访问方式
- 📏 UMD 文件大小约 20KB，包含完整功能和类型定义

### Usage Examples

#### NPM 方式
```javascript
import toast from 'bare-toast';
toast.success('Hello World!');
```

#### Script 标签方式
```html
<script src="./dist/index.umd.js"></script>
<script>
  const { toast } = BareToast;
  toast.success('Hello World!');
</script>
```

## [1.0.2] - Previous Release
- 基础 Toast 功能实现
- 支持 success、error、warning、info、loading 类型
- Promise 操作支持
- Shadow DOM 样式隔离
- CustomEvent 事件系统
