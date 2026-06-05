interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  function add(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ ...toast, id, duration: toast.duration ?? 4000 })
    setTimeout(() => remove(id), toast.duration ?? 4000)
  }

  function remove(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) toasts.value.splice(index, 1)
  }

  function success(title: string, message?: string) {
    add({ type: 'success', title, message })
  }

  function error(title: string, message?: string) {
    add({ type: 'error', title, message })
  }

  function info(title: string, message?: string) {
    add({ type: 'info', title, message })
  }

  return { toasts: readonly(toasts), add, remove, success, error, info }
}
