import { ref, onMounted, onUnmounted } from 'vue'
import { fetchQuote } from '../services/stockService'
import { loadAlerts, saveAlerts } from '../services/alertsStorage'
import { useAlarmSound } from './useAlarmSound'

// Finnhub free tier permite 60 llamadas/min. Con este intervalo, hasta ~7-8
// alarmas simultáneas quedan cómodas dentro del límite. Si en algún momento
// se necesitan más, conviene mover el refresh al backend (fase 2).
const REFRESH_MS = 8000

function newId() {
  return 'alert_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
}

export function useAlerts() {
  const alerts = ref(loadAlerts().length ? loadAlerts() : [{ ...blankAlert() }])
  const alarm = useAlarmSound()
  const triggeredMessage = ref('')

  // último precio visto por alarma, para detectar el CRUCE (no solo "está por encima/debajo")
  const priceHistory = {}
  let timer = null
  let isFetching = false

  function blankAlert() {
    return {
      id: newId(), ticker: '', type: 'IN', price: null,
      livePrice: null, diffPercent: null, triggered: false,
      updatedAt: Date.now(), loading: false, error: null,
    }
  }

  function persist() {
    saveAlerts(alerts.value)
    // TODO (fase 2): acá va el PUT /api/alerts en vez de (o además de) saveAlerts()
  }

  function addAlert() {
    alerts.value.unshift(blankAlert())
    persist()
  }

  function removeAlert(id) {
    delete priceHistory[id]
    alerts.value = alerts.value.filter(a => a.id !== id)
    persist()
  }

  function updateAlert(id, patch) {
    const alert = alerts.value.find(a => a.id === id)
    if (!alert) return
    Object.assign(alert, patch, { triggered: false, updatedAt: Date.now() })
    delete priceHistory[id]
    persist()
    refreshOne(alert)
  }

  async function refreshOne(alert) {
    if (!alert.ticker) {
      alert.livePrice = null
      alert.diffPercent = null
      return
    }
    alert.loading = true
    alert.error = null
    try {
      const q = await fetchQuote(alert.ticker)
      alert.livePrice = q.price
      alert.error = null

      if (alert.price) {
        const roundLive = Math.round(q.price * 100) / 100
        const roundTarget = Math.round(alert.price * 100) / 100
        alert.diffPercent = ((roundTarget - roundLive) / roundLive) * 100

        const prevPrice = priceHistory[alert.id]
        let shouldTrigger = false
        if (prevPrice !== undefined) {
          const crossedUp = prevPrice < roundTarget && roundLive >= roundTarget
          const crossedDown = prevPrice > roundTarget && roundLive <= roundTarget
          const hitExact = roundLive === roundTarget
          shouldTrigger = crossedUp || crossedDown || hitExact
        }
        priceHistory[alert.id] = roundLive

        if (shouldTrigger && !alert.triggered) {
          alert.triggered = true
          const typeLabel = { IN: 'IN', TARGET: 'TARGET', STOP_LOSS: 'STOP LOSS' }[alert.type] || alert.type
          triggeredMessage.value = `🚨 ${alert.ticker} · ${typeLabel}: $${q.price}`
          alarm.start()
          persist()
        }
      } else {
        alert.diffPercent = null
      }
    } catch (e) {
      alert.error = e.message
      alert.livePrice = null
    } finally {
      alert.loading = false
    }
  }

  async function refreshAll() {
    if (isFetching) return
    isFetching = true
    await Promise.all(alerts.value.map(refreshOne))
    isFetching = false
  }

  function acknowledgeAlarm() {
    alarm.stop()
  }

  onMounted(() => {
    refreshAll()
    timer = setInterval(refreshAll, REFRESH_MS)
  })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    alerts, addAlert, removeAlert, updateAlert,
    isRinging: alarm.isRinging, triggeredMessage, acknowledgeAlarm,
  }
}
