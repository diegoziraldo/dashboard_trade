<script setup>
import { computed, watch } from 'vue'
import SearchBar from './components/SearchBar.vue'
import FinanceTicker from './components/FinanceTicker.vue'
import StockPanel from './components/StockPanel.vue'
import AlertsPanel from './components/AlertsPanel.vue'
import { useDolar } from './composables/useDolar'
import { useUsStocks, useCedears } from './composables/useStocks'

// --- Datos macro (dólar / riesgo país), en vivo, sin API key ---
const { dolares, riesgoPais, loading: dolarLoading } = useDolar()

// --- Panel izquierdo: acciones USA (Finnhub) ---
const { stocks: usStocks, addTicker: addUsTicker, removeTicker: removeUsTicker } = useUsStocks([
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Alphabet' },
])

// --- Panel de CEDEARs (precio teórico en vivo = USD Finnhub ÷ ratio × CCL) ---
const cclRate = computed(() => dolares.value?.contadoconliqui?.venta ?? 0)

const { stocks: cedearStocks, addTicker: addCedear, removeTicker: removeCedear, updateRatio, recalcAll } =
  useCedears(
    [
      { symbol: 'AAPL.BA', underlyingSymbol: 'AAPL', ratio: 20, name: 'Apple Cedear' },
      { symbol: 'KO.BA', underlyingSymbol: 'KO', ratio: 20, name: 'Coca-Cola Cedear' },
      { symbol: 'MELI.BA', underlyingSymbol: 'MELI', ratio: 48, name: 'Mercado Libre' },
      { symbol: 'GGAL.BA', underlyingSymbol: 'GGAL', ratio: 10, name: 'Grupo Financiero Galicia' },
      { symbol: 'YPFD.BA', underlyingSymbol: 'YPF', ratio: 1, name: 'YPF S.A.' },
    ],
    cclRate
  )

// Cuando cambia el CCL (cada refresh de useDolar), recalculamos los precios
// teóricos de CEDEARs sin volver a pegarle a Finnhub.
watch(cclRate, () => recalcAll())
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="main-layout">
      <!-- Columna 1: Acciones USA (Izquierda) -->
      <div class="column">
        <StockPanel
          title="Acciones USA (NYSE / NASDAQ)"
          :stocks="usStocks"
          placeholder="Ej: AAPL, TSLA"
          @add="addUsTicker"
          @remove="removeUsTicker"
        />
      </div>

      <!-- Columna 2: Centro (Buscador, Ticker macro y el Panel de Alertas abajo) -->
      <div class="center-column">
        <SearchBar />
        <FinanceTicker :dolares="dolares" :riesgo-pais="riesgoPais" :loading="dolarLoading" />
        
        <div class="alerts-container">
          <div class="alerts-wrapper">
            <AlertsPanel />
          </div>
        </div>
      </div>

      <!-- Columna 3: Derecha (CEDEARs arriba + espacio vacío abajo para tu próximo componente) -->
      <div class="column right-column">
        <div class="right-stack">
          <div class="cedears-wrapper">
            <StockPanel
              title="CEDEARs (BCBA)"
              :stocks="cedearStocks"
              placeholder="Ej: GGAL, YPF (sin .BA)"
              :is-cedear="true"
              @add="addCedear"
              @remove="removeCedear"
              @update-ratio="updateRatio"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--bg-app, #0b0f19);
  padding: 20px;
}

.main-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr) 360px;
  gap: 20px;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  align-items: start;
}

.column {
  width: 100%;
  min-width: 0;
}

.center-column {
  width: 100%;
  min-width: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alerts-container {
  width: 100%;
  text-align: left;
}

.right-column {
  width: 100%;
}

.right-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.alerts-wrapper {
  background-color: #111827;
  border: 1px solid #1f2937;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.cedears-wrapper {
  width: 100%;
}

/* Espacio vacío provisional para cuando pases el siguiente código */
.empty-slot {
  width: 100%;
  min-height: 150px;
  border: 2px dashed #1f2937;
  border-radius: 12px;
  background-color: rgba(17, 24, 39, 0.4);
  box-sizing: border-box;
}

@media(max-width: 1400px){
  .main-layout {
    grid-template-columns: 280px minmax(0, 1fr) 320px;
  }
}

@media(max-width: 1100px){
  .main-layout {
    grid-template-columns: 1fr 1fr;
  }
  .right-column {
    grid-column: 1 / -1;
  }
}

@media(max-width: 768px){
  .main-layout {
    grid-template-columns: 1fr;
    padding: 0;
  }
}
</style>