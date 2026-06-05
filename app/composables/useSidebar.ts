export function useSidebar() {
  const isOpen = useState('sidebar-open', () => false)
  const toggle = () => { isOpen.value = !isOpen.value }
  const close = () => { isOpen.value = false }
  return { isOpen, toggle, close }
}
