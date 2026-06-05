<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

    <div class="relative z-10 w-full max-w-sm">

      <!-- Logo -->
      <div class="text-center mb-8">
        <img
          src="/images/logonebula.png"
          alt="Nebula Eventos"
          class="h-20 w-auto mx-auto mb-4 drop-shadow-[0_0_20px_rgba(109,40,217,0.8)]"
        >
        <p class="text-slate-500 text-xs font-mono tracking-[0.3em] uppercase">Portal de Acceso</p>
      </div>

      <!-- Card -->
      <div class="login-card p-8 rounded-2xl">

        <h2 class="font-display text-xl font-bold text-white mb-1">Iniciar Sesión</h2>
        <p class="text-slate-500 text-sm mb-7">Ingresa tus credenciales para continuar</p>

        <form @submit.prevent="handleLogin" class="space-y-5">

          <!-- Email -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div class="relative">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <input
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="usuario@nebula.mx"
                class="login-input"
                :disabled="loading"
                required
              >
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div class="relative">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                class="login-input pr-icon"
                :disabled="loading"
                required
              >
              <button
                type="button"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-violet-400 transition-colors"
                @click="showPwd = !showPwd"
              >
                <svg v-if="!showPwd" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Error -->
          <Transition name="err">
            <div v-if="error" class="flex items-center gap-2.5 p-3 rounded-xl" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);">
              <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-400">{{ error }}</p>
            </div>
          </Transition>

          <!-- Submit -->
          <button
            type="submit"
            class="login-btn w-full py-3 rounded-xl font-display font-bold text-white text-sm flex items-center justify-center gap-2"
            :disabled="loading"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            {{ loading ? 'Autenticando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-violet-900/20 text-center">
          <NuxtLink to="/" class="text-xs text-slate-600 hover:text-slate-400 transition font-mono tracking-wider">
            ← Volver al inicio
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const router = useRouter()
const { success } = useToast()

if (authStore.isAuthenticated) {
  navigateTo('/dashboard')
}

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPwd = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(form.email, form.password)
    success('Bienvenido', `Hola, ${authStore.user?.name}`)
    await router.push('/dashboard')
  }
  catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error de autenticación'
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-card {
  background: rgba(7, 11, 25, 0.72);
  border: 1px solid rgba(109, 40, 217, 0.22);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow:
    0 0 0 1px rgba(109,40,217,0.08),
    0 30px 80px rgba(0,0,0,0.55),
    0 0 60px rgba(109,40,217,0.07);
}

.login-input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.75rem;
  background: rgba(11, 17, 32, 0.8);
  border: 1px solid rgba(109,40,217,0.2);
  border-radius: 0.625rem;
  color: #E2E8F0;
  font-size: 0.875rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
  outline: none;
}
.login-input.pr-icon {
  padding-right: 2.75rem;
}
.login-input:focus {
  border-color: rgba(109,40,217,0.65);
  box-shadow: 0 0 0 3px rgba(109,40,217,0.12);
  background: rgba(11, 17, 32, 0.95);
}
.login-input::placeholder { color: #3a4d6a; }
.login-input:disabled { opacity: 0.5; cursor: not-allowed; }

.login-btn {
  background: linear-gradient(135deg, #6D28D9, #2563EB);
  border: 1px solid rgba(168,85,247,0.45);
  box-shadow: 0 0 18px rgba(109,40,217,0.35);
  cursor: pointer;
  transition: all 0.25s ease;
}
.login-btn:hover:not(:disabled) {
  box-shadow: 0 0 28px rgba(109,40,217,0.6), 0 0 55px rgba(109,40,217,0.2);
  transform: translateY(-1px);
}
.login-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.err-enter-active, .err-leave-active { transition: all 0.2s ease; }
.err-enter-from, .err-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
