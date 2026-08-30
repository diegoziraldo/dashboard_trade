import { ref, onMounted, onUnmounted } from 'vue'
import { fetchDolares, fetchRiesgoPais } from '../services/dolarService'

const REFRESH_MS = 60_000

/**
 * Composable reutilizable: expone las cotizaciones de dólar y riesgo país
 * como refs reactivos, y se actualiza solo cada 60s mientras el componente
 * que lo usa esté montado.
 */
export function useDolar() {
  const dolares = ref({})       // { oficial: {...}, blue: {...}, bolsa: {...}, contadoconliqui: {...}, cripto: {...} }
  const riesgoPais = ref(null)  // { valor, fecha }
  const loading = ref(true)
  const error = ref(null)
  let timer = null

  async function refresh() {
    try {
      const [dolaresData, riesgoData] = await Promise.all([
        fetchDolares(),
        fetchRiesgoPais(),
      ])
      dolares.value = dolaresData
      riesgoPais.value = riesgoData
      error.value = null
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    refresh()
    timer = setInterval(refresh, REFRESH_MS)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { dolares, riesgoPais, loading, error, refresh }
}
