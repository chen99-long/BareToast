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
  private initialized = false

  constructor() {
    this.init()
  }

  private init() {
    if (this.initialized) return

    // 添加CSS样式
    this.addStyles()

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

  private addStyles() {
    if (document.getElementById("toast-styles")) return

    const style = document.createElement("style")
    style.id = "toast-styles"
    style.textContent = `
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

      .toast-icon.loading {
        animation: none;
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

      .toast-loading-dots {
        display: inline-flex;
        gap: 2px;
        align-items: center;
      }

      .toast-loading-dots span {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: currentColor;
        animation: toast-loading-dots 1.4s ease-in-out infinite both;
      }

      .toast-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
      .toast-loading-dots span:nth-child(2) { animation-delay: -0.16s; }
      .toast-loading-dots span:nth-child(3) { animation-delay: 0s; }

      @keyframes toast-loading-dots {
        0%, 80%, 100% {
          transform: scale(0);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `
    document.head.appendChild(style)
  }

  private createContainer() {
    if (this.container) return

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
    document.body.appendChild(this.container)
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
      const element = document.getElementById(`toast-${id}`)
      if (element) {
        element.style.animation = "toast-slide-out 0.3s ease-in-out forwards"
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
      const element = document.getElementById(`toast-${message.id}`)
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
    const styles = this.getTypeStyles(message.type)

    // 更新背景和边框颜色
    element.style.backgroundColor = styles.bg
    element.style.color = styles.color
    element.style.border = `1px solid ${styles.border}`

    // 更新图标
    const icon = element.querySelector(".toast-icon") as HTMLElement
    if (icon) {
      if (message.type === "loading") {
        icon.classList.add("loading")
        icon.innerHTML = ""
      } else {
        icon.classList.remove("loading")
        icon.innerHTML = styles.icon
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
        closeBtn.style.cssText = `
          flex-shrink: 0;
          font-size: 18px;
          cursor: pointer;
          opacity: 0.7;
          margin-left: 8px;
          transition: opacity 0.2s;
        `
        closeBtn.addEventListener("mouseenter", () => {
          closeBtn.style.opacity = "1"
        })
        closeBtn.addEventListener("mouseleave", () => {
          closeBtn.style.opacity = "0.7"
        })
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
    toastElement.style.cssText = `
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
    `

    // 根据类型设置样式和图标
    const styles = this.getTypeStyles(message.type)
    toastElement.style.backgroundColor = styles.bg
    toastElement.style.color = styles.color
    toastElement.style.border = `1px solid ${styles.border}`

    // 添加图标
    const icon = document.createElement("span")
    icon.className = "toast-icon"
    if (message.type === "loading") {
      icon.classList.add("loading")
      icon.innerHTML = "" // loading 使用 CSS 动画
    } else {
      icon.innerHTML = styles.icon
    }

    // 添加内容
    const content = document.createElement("span")
    content.className = "toast-content"
    content.textContent = message.content
    content.style.cssText = "flex: 1;"

    toastElement.appendChild(icon)
    toastElement.appendChild(content)

    // 添加关闭按钮（loading 类型除外）
    if (message.type !== "loading") {
      const closeBtn = document.createElement("span")
      closeBtn.className = "toast-close"
      closeBtn.innerHTML = "×"
      closeBtn.style.cssText = `
        flex-shrink: 0;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.7;
        margin-left: 8px;
        transition: opacity 0.2s;
      `
      closeBtn.addEventListener("mouseenter", () => {
        closeBtn.style.opacity = "1"
      })
      closeBtn.addEventListener("mouseleave", () => {
        closeBtn.style.opacity = "0.7"
      })
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

  private getTypeStyles(type: ToastType) {
    const styles = {
      success: {
        bg: "#f0f9ff",
        color: "#0c4a6e",
        border: "#7dd3fc",
        icon: "✓",
      },
      error: {
        bg: "#fef2f2",
        color: "#991b1b",
        border: "#fca5a5",
        icon: "✕",
      },
      warning: {
        bg: "#fffbeb",
        color: "#92400e",
        border: "#fcd34d",
        icon: "⚠",
      },
      info: {
        bg: "#f0f9ff",
        color: "#1e40af",
        border: "#93c5fd",
        icon: "ℹ",
      },
      loading: {
        bg: "#f9fafb",
        color: "#374151",
        border: "#d1d5db",
        icon: "",
      },
    }
    return styles[type]
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
