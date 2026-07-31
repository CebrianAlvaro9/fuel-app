import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  base: 'fuel-app',
  server: {
    // host: true expone el servidor en la LAN para probar desde el móvil.
    host: true,
    // Sin puerto fijo: se toma el asignado por PORT si viene, y si no Vite
    // elige (5173 y, si está ocupado, el siguiente libre).
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
})
