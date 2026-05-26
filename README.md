# Práctica: Desarrollo de una Aplicación para Consulta de Carburantes

**Asignatura:** Tecnologías Emergentes  
**Fecha:** 26 de mayo de 2026  
**Alumno:** Álvaro Cebrián Urueña  

---

## Resumen de la práctica
Esta práctica consiste en la validación técnica de la API REST del Ministerio para la Transición Ecológica y el Reto Demográfico para el posterior desarrollo de una aplicación móvil de consulta de carburantes. El objetivo es interactuar con los endpoints públicos del gobierno, extrayendo datos de estaciones de servicio terrestres y marítimas mediante el uso de parámetros en ruta (*path params*), permitiendo un filtrado dinámico por comunidades autónomas, provincias, fechas e históricos de precios.

---

## 1. Apartado 1. Tomando contacto con la API

### Endpoints de Referencia y Diccionarios
Para la obtención de los identificadores (IDs) de filtrado, se han consultado los siguientes recursos de la documentación oficial:
* **Documentación API:** [Ayuda de la API REST](https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/help)
* **Diccionario de Comunidades Autónomas:** `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/ComunidadesAutonomas/`
* **Diccionario de Provincias:** `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/Provincias/`
* **Diccionario de Municipios (Granada - ID 18):** `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/MunicipiosPorProvincia/18`
* **Diccionario de Productos (Combustibles):** `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/ProductosPetroliferos/`

---
#### • Estaciones de servicio de la comunidad de Castilla y León
Para obtener el listado completo de las gasolineras terrestres de esta comunidad, se utiliza el endpoint de filtrado por Comunidad Autónoma (`FiltroCCAA`), empleando el código identificador oficial **`07`** asignado a Castilla y León.
* **Consulta / URL:** `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroCCAA/07`

#### • Listado de postes marítimos por provincia y producto (Castellón y Gasolina 95 E5)
En este caso se cambia la raíz del recurso a estaciones marítimas (`EstacionesMaritimas`) y se utiliza el endpoint de cruce múltiple `FiltroProvinciaProducto`. Se aplica el identificador **`12`** para la provincia de Castellón y el identificador **`1`** para el producto Gasolina 95 E5.
* **Consulta / URL:** `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/PostesMaritimos/FiltroProvinciaProducto/12/1`

#### • Precios de estaciones de servicio para el día 12/02/2026 y el municipio de Cúllar
Para la consulta de datos históricos en una fecha concreta se recurre al recurso `EstacionesTerrestresHistorial`, introduciendo la fecha con estructura `DD-MM-AAAA`. Para acotar los resultados al municipio de Cúllar, se concatena al final su código de municipio correspondiente, que es el **`2724`**.
* **Consulta / URL:** `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHist/filtroMunicipio/12-02-2026/2724`
