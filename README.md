# BareToast

一个轻量级的原生 Toast 通知库，零依赖，使用 CustomEvent 实现。

## 特性

- 🚀 零依赖，纯原生实现
- 🎨 支持多种消息类型：success、error、warning、info、loading
- ⚡️ 支持 Promise 操作
- 🎯 支持自定义样式和动画
- 🔄 支持手动关闭和自动关闭
- 📱 响应式设计，适配各种屏幕尺寸

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

BareToast 使用 CSS 变量来定义样式，你可以通过覆盖这些变量来自定义外观：

```css
:root {
  --toast-bg-success: #f0f9ff;
  --toast-color-success: #0c4a6e;
  --toast-border-success: #7dd3fc;
  
  --toast-bg-error: #fef2f2;
  --toast-color-error: #991b1b;
  --toast-border-error: #fca5a5;
  
  --toast-bg-warning: #fffbeb;
  --toast-color-warning: #92400e;
  --toast-border-warning: #fcd34d;
  
  --toast-bg-info: #f0f9ff;
  --toast-color-info: #1e40af;
  --toast-border-info: #93c5fd;
  
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

## License

MIT 