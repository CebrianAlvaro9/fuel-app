import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from "@tailwindcss/vite";
import basicSsl from '@vitejs/plugin-basic-ssl';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    /*
     * HTTPS con certificado autofirmado para dev y preview. No afecta al build.
     * Es imprescindible para probar desde el móvil por la LAN: la
     * geolocalización solo funciona en contexto seguro, y por http://192.168.x.x
     * falla en silencio en iOS y Android — con lo que el mapa, que depende de
     * tener ubicación, no se puede ni abrir.
     */
    basicSsl(),
  ],
  base: '/fuel-app/',
  server: {
    // host: true expone el servidor en la LAN para probar desde el móvil.
    host: true,
    // Sin puerto fijo: se toma el asignado por PORT si viene, y si no Vite
    // elige (5173 y, si está ocupado, el siguiente libre).
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
