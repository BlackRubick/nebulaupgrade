<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div />
      <button class="btn-nebula btn-primary" @click="showCreate = true">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Nuevo Usuario
      </button>
    </div>

    <!-- Table -->
    <div class="card-nebula overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <table v-else class="table-nebula">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Boletos</th>
            <th>Estado</th>
            <th>Creado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <span class="font-medium text-slate-200">{{ user.name }}</span>
              </div>
            </td>
            <td class="text-slate-400 text-xs font-mono">{{ user.email }}</td>
            <td>
              <span class="badge text-xs" :class="roleBadge(user.role)">{{ roleLabel(user.role) }}</span>
            </td>
            <td class="font-mono text-slate-300">{{ user._count?.tickets ?? 0 }}</td>
            <td>
              <span class="badge text-xs" :class="user.active ? 'badge-active' : 'badge-cancelled'">
                {{ user.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="text-slate-600 text-xs font-mono">{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="flex items-center gap-1">
                <button
                  v-if="!user.isSuperAdmin || authStore.isSuperAdmin"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-900/20 transition"
                  title="Editar"
                  @click="editUser = user"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  v-if="user.id !== authStore.user?.id && (!user.isSuperAdmin || authStore.isSuperAdmin)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition"
                  title="Eliminar"
                  @click="openDelete(user)"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <Transition name="modal">
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="showCreate = false">
        <div class="card-nebula p-6 w-full max-w-md">
          <h3 class="font-display font-semibold text-white mb-5">Nuevo usuario</h3>
          <form @submit.prevent="handleCreate" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nombre</label>
              <input v-model="createForm.name" class="input-nebula" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</label>
              <input v-model="createForm.email" type="email" class="input-nebula" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contraseña</label>
              <input v-model="createForm.password" type="password" placeholder="Mínimo 8 caracteres" class="input-nebula" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Rol</label>
              <select v-model="createForm.role" class="input-nebula">
                <option value="VENDOR">Vendedor</option>
                <option value="ADMIN">Administrador</option>
                <option value="SCANNER">Escáner</option>
              </select>
            </div>
            <div v-if="authStore.isSuperAdmin" class="flex items-center gap-3 p-3 rounded-lg glass border border-violet-500/20">
              <input id="superAdminCreate" v-model="createForm.isSuperAdmin" type="checkbox" class="w-4 h-4 accent-violet-500">
              <label for="superAdminCreate" class="text-sm text-slate-300 cursor-pointer select-none">
                Super Admin
                <span class="ml-1 text-xs text-violet-400 font-mono">(acceso total)</span>
              </label>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" class="btn-nebula btn-ghost flex-1" @click="showCreate = false">Cancelar</button>
              <button type="submit" class="btn-nebula btn-primary flex-1" :disabled="creating">
                {{ creating ? 'Creando...' : 'Crear usuario' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Delete Modal -->
    <Transition name="modal">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="deleteTarget = null">
        <div class="card-nebula p-6 w-full max-w-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-display font-semibold text-white">Eliminar usuario</h3>
              <p class="text-xs text-slate-500 mt-0.5">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <p class="text-slate-400 text-sm mb-5">
            ¿Seguro que quieres eliminar a <span class="text-white font-semibold">{{ deleteTarget.name }}</span>?
          </p>
          <div class="flex gap-3">
            <button class="btn-nebula btn-ghost flex-1" @click="deleteTarget = null">Cancelar</button>
            <button class="btn-nebula btn-danger flex-1" :disabled="deleting" @click="handleDelete">
              {{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Edit Modal -->
    <Transition name="modal">
      <div v-if="editUser" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="editUser = null">
        <div class="card-nebula p-6 w-full max-w-md">
          <h3 class="font-display font-semibold text-white mb-5">Editar {{ editUser.name }}</h3>
          <form @submit.prevent="handleUpdate" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nombre</label>
              <input v-model="editForm.name" class="input-nebula" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Rol</label>
              <select v-model="editForm.role" class="input-nebula">
                <option value="VENDOR">Vendedor</option>
                <option value="ADMIN">Administrador</option>
                <option value="SCANNER">Escáner</option>
              </select>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg glass">
              <input id="activeToggle" v-model="editForm.active" type="checkbox" class="w-4 h-4 accent-violet-500">
              <label for="activeToggle" class="text-sm text-slate-300 cursor-pointer select-none">Usuario activo</label>
            </div>
            <div v-if="authStore.isSuperAdmin" class="flex items-center gap-3 p-3 rounded-lg glass border border-violet-500/20">
              <input id="superAdminEdit" v-model="editForm.isSuperAdmin" type="checkbox" class="w-4 h-4 accent-violet-500">
              <label for="superAdminEdit" class="text-sm text-slate-300 cursor-pointer select-none">
                Super Admin
                <span class="ml-1 text-xs text-violet-400 font-mono">(acceso total)</span>
              </label>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" class="btn-nebula btn-ghost flex-1" @click="editUser = null">Cancelar</button>
              <button type="submit" class="btn-nebula btn-primary flex-1" :disabled="updating">
                {{ updating ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: ['auth', 'admin'] })

const authStore = useAuthStore()
const { $api } = useApi()
const { success } = useToast()

interface User {
  id: string
  name: string
  email: string
  role: string
  isSuperAdmin: boolean
  active: boolean
  createdAt: string
  _count?: { tickets: number }
}

const loading = ref(true)
const users = ref<User[]>([])
const showCreate = ref(false)
const editUser = ref<User | null>(null)
const deleteTarget = ref<User | null>(null)
const creating = ref(false)
const updating = ref(false)
const deleting = ref(false)

const createForm = reactive({ name: '', email: '', password: '', role: 'ADMIN', isSuperAdmin: false })
const editForm = reactive({ name: '', role: '', active: true, isSuperAdmin: false })

watch(editUser, (u) => {
  if (u) {
    editForm.name = u.name
    editForm.role = u.role
    editForm.active = u.active
    editForm.isSuperAdmin = u.isSuperAdmin
  }
})

onMounted(fetchUsers)

async function fetchUsers() {
  try {
    users.value = await $api<User[]>('/users')
  }
  finally {
    loading.value = false
  }
}

async function handleCreate() {
  creating.value = true
  try {
    await $api('/users', { method: 'POST', body: JSON.stringify(createForm) })
    success('Usuario creado', `${createForm.name} fue creado exitosamente`)
    showCreate.value = false
    createForm.name = ''
    createForm.email = ''
    createForm.password = ''
    createForm.isSuperAdmin = false
    await fetchUsers()
  }
  finally {
    creating.value = false
  }
}

async function handleUpdate() {
  if (!editUser.value) return
  updating.value = true
  try {
    await $api(`/users/${editUser.value.id}`, { method: 'PUT', body: JSON.stringify(editForm) })
    success('Usuario actualizado')
    editUser.value = null
    await fetchUsers()
  }
  finally {
    updating.value = false
  }
}

function openDelete(user: User) {
  deleteTarget.value = user
}

async function handleDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await $api(`/users/${deleteTarget.value.id}`, { method: 'DELETE' })
    success('Usuario eliminado', `${deleteTarget.value.name} fue eliminado`)
    deleteTarget.value = null
    await fetchUsers()
  }
  finally {
    deleting.value = false
  }
}

function roleBadge(r: string) {
  return r === 'ADMIN' ? 'badge-active' : r === 'VENDOR' ? 'badge-finished' : 'badge-draft'
}

function roleLabel(r: string) {
  return { ADMIN: 'Admin', VENDOR: 'Vendedor', SCANNER: 'Escáner' }[r] ?? r
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
