<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="glass rounded-xl p-4 shadow-2xl cursor-pointer"
          :class="toastClass(toast.type)"
          @click="remove(toast.id)"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <span v-if="toast.type === 'success'" class="text-emerald-400">✓</span>
              <span v-else-if="toast.type === 'error'" class="text-red-400">✕</span>
              <span v-else-if="toast.type === 'warning'" class="text-amber-400">⚠</span>
              <span v-else class="text-blue-400">ℹ</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-white">{{ toast.title }}</p>
              <p v-if="toast.message" class="text-xs text-slate-400 mt-0.5">{{ toast.message }}</p>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()

function toastClass(type: string) {
  switch (type) {
    case 'success': return 'border-emerald-500/30'
    case 'error': return 'border-red-500/30'
    case 'warning': return 'border-amber-500/30'
    default: return 'border-blue-500/30'
  }
}
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
