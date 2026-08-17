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
     * HTTPS con certificado autofirmado, solo bajo demanda: `HTTPS=1 npm run dev`.
     *
     * Hace falta para probar desde el móvil por la LAN, porque la
     * geolocalización solo funciona en contexto seguro y por http://192.168.x.x
     * falla en silencio en iOS y Android. Pero forzarlo siempre obliga a pasar
     * por el aviso de certificado en cada herramienta que abra la app en local,
     * y desde que el mapa navega libre sin ubicación ya no es la vía normal de
     * trabajo. No afecta al build.
     */
    ...(process.env.HTTPS ? [basicSsl()] : []),
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
