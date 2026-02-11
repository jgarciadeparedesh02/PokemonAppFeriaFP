# Plan de Mejoras para PokemonAppFeriaFP

Este documento detalla las mejoras propuestas para la aplicación, divididas por categorías para facilitar su implementación.

---

## 🚀 1. Optimización y Rendimiento (Prioridad Alta)

### **A. Caché de la API**
Actualmente, la app realiza múltiples peticiones a la API de TCGDex cada vez que se navega.
- **Acción:** Implementar `React Query` (TanStack Query) o un sistema de caché manual usando `localStorage` o `IndexedDB`.
- **Beneficio:** Carga instantánea de sets y cartas ya vistos, y reducción de consumo de datos.

### **B. Optimización del "Pack Opening"**
El proceso de abrir un sobre es pesado porque consulta detalles individuales de ~45 cartas para determinar su rareza.
- **Acción:** Almacenar un "mapeo de rarezas" por expansión la primera vez que se carga. Así, las siguientes aperturas del mismo set no necesitarán nuevas consultas de detalle.
- **Acción:** Usar `Promise.allSettled` para evitar que una sola carta fallida rompa toda la apertura.

---

## 💎 2. Experiencia de Usuario (UX) y Gamificación

### **A. Sistema de Economía**
Actualmente los sobres son gratuitos e ilimitados.
- **Acción:** Añadir una moneda virtual (ej. "PokeCoins").
- **Acción:** Ganar monedas por entrar diariamente o por completar misiones.
- **Acción:** Poner precio a los sobres según la expansión (las más nuevas o raras más caras).

### **B. Filtros Avanzados en la Colección**
La búsqueda actual solo es por nombre.
- **Acción:** Añadir filtros por:
  - **Rareza:** (Comunes, Holos, Ultra Raras, etc.)
  - **Tipo:** (Fuego, Agua, Planta, etc.)
  - **Estado:** (Solo las que tengo vs. Ver faltantes).

### **C. Efectos de Sonido (SFX)**
- **Acción:** Añadir sonidos al:
  - Romper el sobre (rasguido).
  - Revelar una carta (swipe/woosh).
  - Encontrar una carta rara (brillo/fanfarria).

---

## 🎨 3. Calidad Visual (UI)

### **A. Mejora del Efecto Holo**
El efecto actual es una máscara estática.
- **Acción:** Integrar una librería de shaders o efectos CSS dinámicos que reaccionen al movimiento del ratón o inclinación del móvil (usando el giroscopio).

### **B. Detalles de Carta Expandidos**
Al pulsar una carta en la colección:
- **Acción:** Mostrar ataques, debilidades y descripción (flavor text).
- **Acción:** Enlace directo a la carta en TCGPlayer o similar para ver precios reales.

---

## 🛠️ 4. Arquitectura de Código

### **A. Migración a TypeScript**
- **Beneficio:** Evitar errores de "undefined" al acceder a datos complejos de la API de Pokémon que no siempre vienen completos.

### **B. Centralización de Constantes**
- **Acción:** Crear un archivo `src/constants/pokemon.js` para los pesos de las rarezas, la URL de la API y las configuraciones de los sobres.

### **C. Manejo de Errores (Error Boundaries)**
- **Acción:** Implementar componentes que capturen errores en el renderizado para que la app no se quede en blanco si falla un componente específico.

---

## 📱 5. Funcionalidades Extra (PWA)

### **A. Soporte Offline**
- **Acción:** Convertir la app en una **PWA (Progressive Web App)** oficial.
- **Beneficio:** Los usuarios pueden "instalar" la app en su móvil y ver su colección incluso sin conexión a internet.

### **B. Intercambio de Repetidas**
- **Acción:** Un sistema simple donde puedas "vender" tus cartas repetidas por monedas para comprar más sobres.
