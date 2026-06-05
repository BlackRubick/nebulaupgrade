<template>
  <div class="min-h-screen flex">
    <NebulaBg />

    <!-- Overlay oscuro en mobile cuando sidebar está abierto -->
    <Transition name="fade">
      <div
        v-if="sidebar.isOpen.value"
        class="fixed inset-0 bg-black/60 z-30 lg:hidden"
        @click="sidebar.close()"
      />
    </Transition>

    <DashboardSidebar />

    <!-- Contenido principal — en mobile ocupa todo el ancho -->
    <div class="flex-1 flex flex-col min-w-0 lg:ml-64">
      <DashboardHeader />
      <main class="flex-1 p-4 md:p-6 overflow-auto">
        <slot />
      </main>
    </div>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
const sidebar = useSidebar()
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
