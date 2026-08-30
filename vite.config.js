import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Config estándar de Vite + Vue.
// Cuando armemos el backend (fase 2), acá vamos a agregar un proxy
// tipo server.proxy['/api'] -> http://localhost:3000 para hablar con Express/SQLite.
export default defineConfig({
  plugins: [vue()],
})
