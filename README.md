# Fuel App — Consulta de Carburantes
🌐 **Demo:** [https://cebrianalvaro9.github.io/fuel-app/](https://cebrianalvaro9.github.io/fuel-app/)

SPA hecha en React y TypeScript para consultar los precios de las gasolineras (terrestres y marítimas) usando la API oficial del Ministerio. 

La idea principal es tener una herramienta rápida para encontrar la gasolina más barata cerca de ti.

## Estructura y Peticiones
El proyecto está dividido en módulos para separar la interfaz de la lógica (filtros, listados, toggle, etc.). 

Para no sobrecargar la API de golpe, los filtros de ubicación cargan en cascada: primero comunidades, al elegir una se cargan sus provincias, y luego sus municipios.

Usamos **TanStack Query** para gestionar las peticiones y la caché. Además, un helper (`endpointBuilder`) se encarga de montar la URL final dependiendo de si buscas terrestres o marítimas y de los filtros que tengas activos.

## Rendimiento y Virtualización
La API puede devolver más de 11.000 estaciones en una sola consulta. Pintar todo eso de golpe bloquearía el navegador.

Para evitarlo, implementamos **virtualización del DOM** con `@tanstack/react-virtual`. La app solo dibuja las tarjetas que caben en tu pantalla en ese momento y las va reciclando al hacer scroll. Así el consumo de RAM es mínimo.

## Geolocalización y Ahorro
Los datos de la API se limpian y preparan en un custom hook (`useStationsData`), donde se normalizan los precios y las coordenadas.

Aquí entra la lógica principal: si activas la ubicación y filtras por un combustible, el sistema usa la **fórmula de Haversine** para calcular a qué distancia real está cada gasolinera. 

Con eso, la app cruza los datos y te muestra las 50 opciones más baratas y cercanas a tu posición. Si prefieres no usar la ubicación, la lista se ordena de menor a mayor precio por defecto.

## Stack
- **Core:** React 19, TypeScript, Vite
- **Peticiones y estado:** @tanstack/react-query
- **Listas gigantes:** @tanstack/react-virtual
- **UI:** Tailwind CSS, DaisyUI, react-day-picker

## Ejecución Local

```bash
# Instalar dependencias
npm install

# Levantar entorno de desarrollo
npm run dev

# Generar build de producción
npm run build
