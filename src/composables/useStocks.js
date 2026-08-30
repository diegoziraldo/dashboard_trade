import { ref } from 'vue'
import { fetchQuote, getTheoreticalCedear } from '../services/stockService'

/**
 * Watchlist de acciones de EE.UU. (NYSE/NASDAQ), con precio real de Finnhub.
 * @param {Array<{symbol:string, name:string}>} initialList
 */
export function useUsStocks(initialList) {
  const stocks = ref(
    initialList.map(s => ({ ...s, price: null, changePercent: null, loading: true, error: null }))
  )

  async function refreshOne(stock) {
    stock.loading = true
    stock.error = null
    try {
      const q = await fetchQuote(stock.symbol)
      stock.price = q.price
      stock.changePercent = q.changePercent
    } catch (e) {
      stock.error = e.message
    } finally {
      stock.loading = false
    }
  }

  async function refreshAll() {
    await Promise.all(stocks.value.map(refreshOne))
  }

  function addTicker(symbol) {
    symbol = symbol.trim().toUpperCase()
    if (!symbol || stocks.value.some(s => s.symbol === symbol)) return
    const stock = { symbol, name: 'Personalizado', price: null, changePercent: null, loading: true, error: null }
    stocks.value.unshift(stock)
    refreshOne(stock)
    // TODO (fase 2 - backend/SQLite): POST /api/watchlist { symbol, type: 'us' }
    // para que este ticker quede guardado y vuelva a aparecer al recargar la página.
  }

  function removeTicker(symbol) {
    stocks.value = stocks.value.filter(s => s.symbol !== symbol)
    // TODO (fase 2): DELETE /api/watchlist/:id
  }

  return { stocks, refreshAll, addTicker, removeTicker }
}

/**
 * Watchlist de CEDEARs (BYMA). El precio no viene de Finnhub (no cubre BYMA
 * en el plan gratis): se calcula en vivo como (precio USD ÷ ratio) × CCL.
 * @param {Array<{symbol:string, underlyingSymbol:string, ratio:number, name:string}>} initialList
 * @param {import('vue').Ref<number>} cclRateRef ref reactivo con la cotización actual del CCL
 */
export function useCedears(initialList, cclRateRef) {
  const stocks = ref(
    initialList.map(s => ({ ...s, usdPrice: null, price: null, changePercent: null, loading: true, error: null }))
  )

  async function refreshOne(stock) {
    stock.loading = true
    stock.error = null
    try {
      const q = await fetchQuote(stock.underlyingSymbol)
      stock.usdPrice = q.price
      stock.changePercent = q.changePercent
      stock.price = getTheoreticalCedear(q.price, stock.ratio, cclRateRef.value)
    } catch (e) {
      stock.error = e.message
    } finally {
      stock.loading = false
    }
  }

  async function refreshAll() {
    await Promise.all(stocks.value.map(refreshOne))
  }

  /** Recalcula todos los precios teóricos cuando cambia el CCL, sin re-pedir a Finnhub. */
  function recalcAll() {
    stocks.value.forEach(stock => {
      if (stock.usdPrice) stock.price = getTheoreticalCedear(stock.usdPrice, stock.ratio, cclRateRef.value)
    })
  }

  function updateRatio(symbol, ratio) {
    const stock = stocks.value.find(s => s.symbol === symbol)
    if (!stock) return
    stock.ratio = Number(ratio) || stock.ratio
    if (stock.usdPrice) stock.price = getTheoreticalCedear(stock.usdPrice, stock.ratio, cclRateRef.value)
  }

  function addTicker(underlyingSymbol, ratio = 20) {
    underlyingSymbol = underlyingSymbol.trim().toUpperCase()
    if (!underlyingSymbol) return
    const symbol = underlyingSymbol + '.BA'
    if (stocks.value.some(s => s.symbol === symbol)) return
    const stock = {
      symbol, underlyingSymbol, ratio, name: 'Personalizado',
      usdPrice: null, price: null, changePercent: null, loading: true, error: null,
    }
    stocks.value.unshift(stock)
    refreshOne(stock)
    // TODO (fase 2): POST /api/watchlist { symbol, underlyingSymbol, ratio, type: 'cedear' }
  }

  function removeTicker(symbol) {
    stocks.value = stocks.value.filter(s => s.symbol !== symbol)
    // TODO (fase 2): DELETE /api/watchlist/:id
  }

  return { stocks, refreshAll, addTicker, removeTicker, updateRatio, recalcAll }
}
