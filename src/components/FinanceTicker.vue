<script setup>
defineProps({
  dolares: { type: Object, default: () => ({}) },
  riesgoPais: { type: Object, default: null },
  loading: { type: Boolean, default: true },
})

function fmt(casa, dolares) {
  const v = dolares?.[casa]?.venta
  return v ? `$${v.toLocaleString('es-AR')}` : '$---'
}
</script>

<template>
  <div class="finance-ticker">
    <div class="fin-card">
      <div class="fin-title">Dólar Blue</div>
      <div class="fin-val mono">{{ loading ? '$---' : fmt('blue', dolares) }}</div>
    </div>
    <div class="fin-card">
      <div class="fin-title">Dólar MEP</div>
      <div class="fin-val mono">{{ loading ? '$---' : fmt('bolsa', dolares) }}</div>
    </div>
    <div class="fin-card">
      <div class="fin-title">Dólar Oficial</div>
      <div class="fin-val mono">{{ loading ? '$---' : fmt('oficial', dolares) }}</div>
    </div>
    <div class="fin-card">
      <div class="fin-title">Riesgo País</div>
      <div class="fin-val mono">{{ riesgoPais ? Math.round(riesgoPais.valor) + ' pb' : '---' }}</div>
    </div>
  </div>
</template>

<style scoped>
.finance-ticker{
  display:grid;grid-template-columns:repeat(2, 1fr);gap:10px;
  width:100%;margin-top:28px;
}
.fin-card{
  background:var(--panel);border:1px solid var(--border);border-radius:8px;
  padding:12px;text-align:left;
}
.fin-title{font-size:11px;color:var(--text-dim);text-transform:uppercase;margin-bottom:4px;font-weight:500;}
.fin-val{font-family:var(--font-num);font-size:16px;font-weight:700;color:#ffffff;}
</style>
