<script setup>
import { computed, watch } from 'vue'
import SearchBar from './components/SearchBar.vue'
import FinanceTicker from './components/FinanceTicker.vue'
import StockPanel from './components/StockPanel.vue'
import AlertsPanel from './components/AlertsPanel.vue'
import Checklist from './components/Checklist.vue'
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

// --- Panel derecho: CEDEARs (precio teórico en vivo = USD Finnhub ÷ ratio × CCL) ---
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
  <!-- Barra superior: buscador + resumen macro, compacta -->
  <div class="topbar">
    <SearchBar compact />
    <FinanceTicker :dolares="dolares" :riesgo-pais="riesgoPais" :loading="dolarLoading" compact />
  </div>

  <!-- Layout principal: las alarmas van al centro, es lo primero que se ve -->
  <div class="main-layout">
    <StockPanel
      title="Acciones USA (NYSE / NASDAQ)"
      :stocks="usStocks"
      placeholder="Ej: AAPL, TSLA"
      @add="addUsTicker"
      @remove="removeUsTicker"
    />

    <!-- Columna central con dos paneles de alertas uno al lado del otro -->
    <div class="center-column">
      <Checklist />
      <AlertsPanel />
    </div>

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
</template>

<style scoped>
.topbar{
  max-width:1480px;
  margin:0 auto;
  padding:20px 16px 0;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
}
.topbar :deep(.search-shell){ max-width:520px; }

.main-layout{
  display:grid;
  grid-template-columns: 260px minmax(500px, 1fr) 260px;
  gap:20px;
  width:100%;
  max-width:1480px;
  margin:0 auto;
  align-items:start;
  padding:20px 16px 30px;
}

/* Contenedor central adaptado para poner los dos paneles uno al lado del otro */
.center-column{
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
}

/* Hacemos que cada panel se reparta el espacio equitativamente */
.center-column > * {
  flex: 1;
  min-width: 0;
}

@media(max-width: 1200px){
  .main-layout{grid-template-columns:1fr; max-width:640px;}
  .center-column{flex-direction:column;} /* En pantallas chicas se apilan verticalmente por comodidad */
}
</style>