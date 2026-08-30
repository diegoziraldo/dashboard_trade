// Persistencia de las alarmas de precio. Hoy vive en localStorage; la forma
// de estas funciones ya está pensada para que, en la fase 2 (backend +
// SQLite), sea un simple cambio de implementación sin tocar los componentes
// que las usan (useAlerts.js es el único que las llama).
//
// TODO (fase 2): reemplazar por:
//   GET  /api/alerts        -> loadAlerts()
//   PUT  /api/alerts        -> saveAlerts(alerts)  (o POST/DELETE por fila)
// Tabla sugerida:
//   alerts(id TEXT PK, ticker TEXT, type TEXT, price REAL, triggered INTEGER,
//          updated_at INTEGER, deleted INTEGER DEFAULT 0)

const STORAGE_KEY = 'vue_finanzas_alerts_v1'

export function loadAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAlerts(alerts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}
