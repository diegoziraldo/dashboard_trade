<script setup>
import { computed, watch } from 'vue'
import SearchBar from './components/SearchBar.vue'
import FinanceTicker from './components/FinanceTicker.vue'
import StockPanel from './components/StockPanel.vue'
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
  <div class="main-layout">
    <!-- Izquierda: Acciones USA -->
    <StockPanel
      title="Acciones USA (NYSE / NASDAQ)"
      :stocks="usStocks"
      placeholder="Ej: AAPL, TSLA"
      @add="addUsTicker"
      @remove="removeUsTicker"
    />

    <!-- Centro: Buscador + resumen macro -->
    <div class="center-column">
      <SearchBar />
      <FinanceTicker :dolares="dolares" :riesgo-pais="riesgoPais" :loading="dolarLoading" />
    </div>

    <!-- Derecha: CEDEARs -->
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
.main-layout{
  display:grid;
  grid-template-columns: 280px minmax(320px, 640px) 280px;
  gap:20px;
  width:100%;
  max-width:1280px;
  margin:0 auto;
  align-items:start;
  padding-top:5vh;
  padding-left:16px;
  padding-right:16px;
  padding-bottom:30px;
}
.center-column{width:100%;text-align:center;}

@media(max-width: 960px){
  .main-layout{grid-template-columns:1fr; max-width:640px;}
}
</style>
