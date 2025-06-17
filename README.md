# BareToast

一个轻量级的原生 Toast 通知库，零依赖，使用 CustomEvent 实现，采用 Shadow DOM 实现样式隔离。

## 特性

- 🚀 零依赖，纯原生实现
- 🎨 支持多种消息类型：success、error、warning、info、loading
- ⚡️ 支持 Promise 操作
- 🎯 支持自定义样式和动画
- 🔄 支持手动关闭和自动关闭
- 📱 响应式设计，适配各种屏幕尺寸
- 🛡️ 使用 Shadow DOM 实现样式隔离，不会影响页面样式

## 安装

```bash
npm install bare-toast
```

## 使用方法

### 基础用法

```typescript
import toast from 'bare-toast'

// 成功提示
toast.success('操作成功')

// 错误提示
toast.error('操作失败')

// 警告提示
toast.warning('请注意')

// 信息提示
toast.info('这是一条信息')

// 加载提示
const loadingId = toast.loading('加载中...')
// 手动关闭加载提示
toast.remove(loadingId)

// 清除所有提示
toast.clear()
```

### Promise 操作

```typescript
import toast from 'bare-toast'

// 基础用法
toast.promise(fetch('/api/data'))

// 自定义提示文案
toast.promise(fetch('/api/data'), {
  pending: '正在加载...',
  success: '加载成功',
  error: '加载失败',
  duration: 3000
})

// 使用 async/await
async function handleSubmit() {
  try {
    const result = await toast.promise(submitData(), {
      pending: '提交中...',
      success: '提交成功',
      error: '提交失败'
    })
    // 处理成功结果
  } catch (error) {
    // 处理错误
  }
}
```

### 自定义配置

每个 toast 方法都支持自定义持续时间（毫秒）：

```typescript
// 显示 5 秒
toast.success('操作成功', 5000)

// 显示 2 秒
toast.error('操作失败', 2000)
```

## 样式隔离

BareToast 使用 Shadow DOM 实现样式隔离，这意味着：

1. Toast 组件的样式完全独立，不会受到页面样式的影响
2. Toast 组件的样式也不会影响到页面其他元素
3. 无需担心样式冲突问题

## API

### 基础方法

- `toast.success(content: string, duration?: number)`
- `toast.error(content: string, duration?: number)`
- `toast.warning(content: string, duration?: number)`
- `toast.info(content: string, duration?: number)`
- `toast.loading(content: string): string`
- `toast.remove(id: string)`
- `toast.clear()`

### Promise 方法

```typescript
toast.promise<T>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
  config?: {
    pending?: string
    success?: string
    error?: string
    duration?: number
  }
): Promise<T>
```

## 样式定制

由于使用了 Shadow DOM，样式定制需要通过 CSS 变量来实现。你可以在全局样式中定义以下变量来自定义 Toast 的外观：

```css
:root {
  /* Success 类型 */
  --toast-bg-success: #f0f9ff;
  --toast-color-success: #0c4a6e;
  --toast-border-success: #7dd3fc;
  
  /* Error 类型 */
  --toast-bg-error: #fef2f2;
  --toast-color-error: #991b1b;
  --toast-border-error: #fca5a5;
  
  /* Warning 类型 */
  --toast-bg-warning: #fffbeb;
  --toast-color-warning: #92400e;
  --toast-border-warning: #fcd34d;
  
  /* Info 类型 */
  --toast-bg-info: #f0f9ff;
  --toast-color-info: #1e40af;
  --toast-border-info: #93c5fd;
  
  /* Loading 类型 */
  --toast-bg-loading: #f9fafb;
  --toast-color-loading: #374151;
  --toast-border-loading: #d1d5db;
}
```

## 浏览器支持

- Chrome >= 60
- Firefox >= 55
- Safari >= 11
- Edge >= 79

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT 