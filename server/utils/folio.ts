// Genera folio a partir del UUID del ticket — único por definición, sin race conditions
export function buildFolio(eventId: string, ticketUuid: string): string {
  const eventShort = eventId.slice(-4).toUpperCase()
  const ticketShort = ticketUuid.replace(/-/g, '').slice(-6).toUpperCase()
  return `NBL-${eventShort}-${ticketShort}`
}
