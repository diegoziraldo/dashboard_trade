# Vue Finanzas — Fase 1 (Frontend)

Proyecto Vue 3 + Vite, componentizado (equivalente a la estructura de
componentes que armarías en React, pero con Single File Components de Vue).

## Estructura

```
src/
├── App.vue                 # Layout de 3 columnas, conecta todo
├── components/
│   ├── SearchBar.vue       # Buscador estilo Google
│   ├── FinanceTicker.vue   # Dólar Blue/MEP/Oficial + Riesgo País
│   ├── StockPanel.vue      # Panel lateral reutilizable (USA y CEDEARs)
│   └── StockItem.vue       # Una fila de la lista
├── composables/
│   ├── useDolar.js         # Estado reactivo de dólar/riesgo país (auto-refresh 60s)
│   └── useStocks.js        # Watchlists de acciones USA y CEDEARs
└── services/
    ├── dolarService.js     # Llamadas a dolarapi.com / argentinadatos.com
    └── stockService.js     # Llamadas a Finnhub + cálculo teórico de CEDEARs
```

## Cómo correrlo

```bash
npm install
cp .env.example .env
# Editá .env y pegá tu clave de Finnhub (gratis en https://finnhub.io/register)
npm run dev
```

## Qué es 100% en vivo y qué es calculado

| Dato | Fuente | Notas |
|---|---|---|
| Dólar Oficial/Blue/MEP/CCL | dolarapi.com | En vivo, sin API key |
| Riesgo País | argentinadatos.com | En vivo, sin API key |
| Acciones USA (AAPL, TSLA, etc.) | Finnhub | En vivo, requiere API key gratis |
| CEDEARs (GGAL.BA, YPFD.BA, etc.) | Calculado | `(precio USD Finnhub ÷ ratio) × CCL`. Finnhub no cubre BYMA en el plan gratis, así que no hay forma de traer el precio "de pizarra" argentino sin una fuente paga — esta fórmula es la que usan los propios inversores y es 100% dinámica (no hay ningún valor hardcodeado). |

Los ratios de CEDEARs son editables desde la UI (campo "Ratio") por si BYMA
los ajusta — no hay ninguna fuente gratuita confiable que los publique en vivo.

## Próximos pasos (fase 2 — pendiente, a definir cuándo arrancamos)

- Backend Node + Express con SQLite (better-sqlite3 o Sequelize).
- Persistir los tickers que el usuario agrega (`addTicker` en los composables
  ya tiene marcado con `// TODO (fase 2)` exactamente dónde va el `POST /api/watchlist`).
- Endpoint `GET /api/watchlist` para cargar el historial guardado al abrir la app.
- Opcional: mover las llamadas a Finnhub al backend para no exponer la API key
  en el navegador (por ahora, al ser un proyecto de uso personal, se llama directo
  desde el cliente).
