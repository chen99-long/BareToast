// Toast 消息类型定义
export type ToastType = "success" | "error" | "warning" | "info" | "loading"

export interface ToastMessage {
  id: string
  type: ToastType
  content: string
  duration: number
  timestamp: number
}

export interface MessageConfig {
  pending?: string
  success?: string
  error?: string
  duration?: number
}

// Toast 事件类型
export interface ToastEventDetail {
  action: "add" | "remove" | "clear" | "update"
  message?: ToastMessage
  id?: string
}

// 自定义事件类型
declare global {
  interface WindowEventMap {
    "toast-event": CustomEvent<ToastEventDetail>
  }
}

class ToastManager {
  private messages: Map<string, ToastMessage> = new Map()
  private container: HTMLElement | null = null
  private shadowRoot: ShadowRoot | null = null
  private initialized = false

  constructor() {
    this.init()
  }

  private init() {
    if (this.initialized) return

    // 确保 DOM 加载完成后再初始化
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.createContainer())
    } else {
      this.createContainer()
    }

    // 监听自定义事件
    window.addEventListener("toast-event", this.handleToastEvent.bind(this))
    this.initialized = true
  }

  private createContainer() {
    if (this.container) return

    // 创建宿主元素
    const host = document.createElement("div")
    host.id = "toast-host"

    // 创建 Shadow DOM
    this.shadowRoot = host.attachShadow({ mode: "closed" })

    // 添加样式到 Shadow DOM 中
    const style = document.createElement("style")
    style.textContent = this.getStyles()
    this.shadowRoot.appendChild(style)

    // 创建容器
    this.container = document.createElement("div")
    this.container.id = "toast-container"
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
      max-width: 400px;
    `

    this.shadowRoot.appendChild(this.container)
    document.body.appendChild(host)
  }

  private getStyles(): string {
    return `
      @keyframes toast-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes toast-slide-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes toast-loading-spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .toast-icon {
        flex-shrink: 0;
        font-size: 16px;
        transition: all 0.3s ease;
        display: inline-block;
        width: 16px;
        height: 16px;
        position: relative;
      }

      .toast-icon.loading::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 16px;
        height: 16px;
        border: 2px solid #e5e7eb;
        border-top: 2px solid #3b82f6;
        border-radius: 50%;
        animation: toast-loading-spin 1s linear infinite;
      }

      .toast-item {
        margin-bottom: 12px;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        pointer-events: auto;
        cursor: pointer;
        animation: toast-slide-in 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        max-width: 100%;
        word-wrap: break-word;
        transition: all 0.3s ease;
      }

      .toast-item.slide-out {
        animation: toast-slide-out 0.3s ease-in-out forwards;
      }

      .toast-content {
        flex: 1;
      }

      .toast-close {
        flex-shrink: 0;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.7;
        margin-left: 8px;
        transition: opacity 0.2s;
      }

      .toast-close:hover {
        opacity: 1;
      }

      /* 类型样式 */
      .toast-success {
        background-color: #f0f9ff;
        color: #0c4a6e;
        border: 1px solid #7dd3fc;
      }

      .toast-error {
        background-color: #fef2f2;
        color: #991b1b;
        border: 1px solid #fca5a5;
      }

      .toast-warning {
        background-color: #fffbeb;
        color: #92400e;
        border: 1px solid #fcd34d;
      }

      .toast-info {
        background-color: #f0f9ff;
        color: #1e40af;
        border: 1px solid #93c5fd;
      }

      .toast-loading {
        background-color: #f9fafb;
        color: #374151;
        border: 1px solid #d1d5db;
      }
    `
  }

  private handleToastEvent(event: CustomEvent<ToastEventDetail>) {
    const { action, message, id } = event.detail

    switch (action) {
      case "add":
        if (message) this.addMessage(message)
        break
      case "remove":
        if (id) this.removeMessage(id)
        break
      case "clear":
        this.clearAll()
        break
      case "update":
        if (message) this.updateMessage(message)
        break
    }
  }

  private addMessage(message: ToastMessage) {
    this.messages.set(message.id, message)
    this.renderMessage(message)

    // 自动移除（除了 loading 类型）
    if (message.duration > 0) {
      setTimeout(() => {
        if (this.messages.has(message.id)) {
          this.removeMessage(message.id)
        }
      }, message.duration)
    }
  }

  private removeMessage(id: string) {
    if (this.messages.has(id)) {
      this.messages.delete(id)
      const element = this.shadowRoot?.getElementById(`toast-${id}`)
      if (element) {
        element.classList.add("slide-out")
        setTimeout(() => {
          if (element.parentNode) {
            element.remove()
          }
        }, 300)
      }
    }
  }

  private clearAll() {
    this.messages.clear()
    if (this.container) {
      this.container.innerHTML = ""
    }
  }

  private updateMessage(message: ToastMessage) {
    if (this.messages.has(message.id)) {
      this.messages.set(message.id, message)
      const element = this.shadowRoot?.getElementById(`toast-${message.id}`)
      if (element) {
        this.updateMessageElement(element, message)

        // 如果更新后的消息有持续时间，设置自动移除
        if (message.duration > 0) {
          setTimeout(() => {
            if (this.messages.has(message.id)) {
              this.removeMessage(message.id)
            }
          }, message.duration)
        }
      }
    }
  }

  private updateMessageElement(element: HTMLElement, message: ToastMessage) {
    // 更新类名
    element.className = `toast-item toast-${message.type}`

    // 更新图标
    const icon = element.querySelector(".toast-icon") as HTMLElement
    if (icon) {
      if (message.type === "loading") {
        icon.classList.add("loading")
        icon.innerHTML = ""
      } else {
        icon.classList.remove("loading")
        icon.innerHTML = this.getTypeIcon(message.type)
      }
    }

    // 更新内容
    const content = element.querySelector(".toast-content") as HTMLElement
    if (content) {
      content.textContent = message.content
    }

    // 处理关闭按钮
    let closeBtn = element.querySelector(".toast-close") as HTMLElement
    if (message.type === "loading") {
      // loading状态移除关闭按钮
      if (closeBtn) {
        closeBtn.remove()
      }
    } else {
      // 非loading状态添加关闭按钮
      if (!closeBtn) {
        closeBtn = document.createElement("span")
        closeBtn.className = "toast-close"
        closeBtn.innerHTML = "×"
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          this.removeMessage(message.id)
        })
        element.appendChild(closeBtn)
      }
    }
  }

  private renderMessage(message: ToastMessage) {
    if (!this.container) return

    const toastElement = document.createElement("div")
    toastElement.id = `toast-${message.id}`
    toastElement.className = `toast-item toast-${message.type}`

    // 添加图标
    const icon = document.createElement("span")
    icon.className = "toast-icon"
    if (message.type === "loading") {
      icon.classList.add("loading")
      icon.innerHTML = "" // loading 使用 CSS 动画
    } else {
      icon.innerHTML = this.getTypeIcon(message.type)
    }

    // 添加内容
    const content = document.createElement("span")
    content.className = "toast-content"
    content.textContent = message.content

    toastElement.appendChild(icon)
    toastElement.appendChild(content)

    // 添加关闭按钮（loading 类型除外）
    if (message.type !== "loading") {
      const closeBtn = document.createElement("span")
      closeBtn.className = "toast-close"
      closeBtn.innerHTML = "×"
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.removeMessage(message.id)
      })
      toastElement.appendChild(closeBtn)
    }

    // 点击整个 toast 也可以关闭（loading除外）
    toastElement.addEventListener("click", () => {
      if (message.type !== "loading") {
        this.removeMessage(message.id)
      }
    })

    this.container.appendChild(toastElement)
  }

  private getTypeIcon(type: ToastType): string {
    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
      loading: "",
    }
    return icons[type]
  }
}

// 创建全局单例
const toastManager = new ToastManager()

// 导出的 toast 对象
export const toast = {
  success(content: string, duration = 3000) {
    const message: ToastMessage = {
      id: crypto.randomUUID(),
      type: "success",
      content,
      duration,
      timestamp: Date.now(),
    }

    window.dispatchEvent(
      new CustomEvent("toast-event", {
        detail: { action: "add", message },
      }),
    )
  },

  error(content: string, duration = 3000) {
    const message: ToastMessage = {
      id: crypto.randomUUID(),
      type: "error",
      content,
      duration,
      timestamp: Date.now(),
    }

    window.dispatchEvent(
      new CustomEvent("toast-event", {
        detail: { action: "add", message },
      }),
    )
  },

  warning(content: string, duration = 3000) {
    const message: ToastMessage = {
      id: crypto.randomUUID(),
      type: "warning",
      content,
      duration,
      timestamp: Date.now(),
    }

    window.dispatchEvent(
      new CustomEvent("toast-event", {
        detail: { action: "add", message },
      }),
    )
  },

  info(content: string, duration = 3000) {
    const message: ToastMessage = {
      id: crypto.randomUUID(),
      type: "info",
      content,
      duration,
      timestamp: Date.now(),
    }

    window.dispatchEvent(
      new CustomEvent("toast-event", {
        detail: { action: "add", message },
      }),
    )
  },

  loading(content: string): string {
    const id = crypto.randomUUID()
    const message: ToastMessage = {
      id,
      type: "loading",
      content,
      duration: 0, // loading 不自动消失
      timestamp: Date.now(),
    }

    window.dispatchEvent(
      new CustomEvent("toast-event", {
        detail: { action: "add", message },
      }),
    )

    return id
  },

  remove(id: string) {
    window.dispatchEvent(
      new CustomEvent("toast-event", {
        detail: { action: "remove", id },
      }),
    )
  },

  clear() {
    window.dispatchEvent(
      new CustomEvent("toast-event", {
        detail: { action: "clear" },
      }),
    )
  },

  update(id: string, type: ToastType, content: string, duration = 3000) {
    const message: ToastMessage = {
      id,
      type,
      content,
      duration,
      timestamp: Date.now(),
    }

    window.dispatchEvent(
      new CustomEvent("toast-event", {
        detail: { action: "update", message },
      }),
    )
  },

  async promise<T>(promiseOrFn: Promise<T> | (() => Promise<T>), config: MessageConfig = {}): Promise<T> {
    const { pending = "加载中...", success = "操作成功", error = "操作失败", duration = 3000 } = config

    const promise = typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn
    const loadingId = this.loading(pending)

    try {
      const result = await promise
      this.update(loadingId, "success", success, duration)
      return result
    } catch (err) {
      this.update(loadingId, "error", err instanceof Error ? err.message : (error as string), duration)
      throw err
    }
  },
}

// 默认导出
export default toast
