# SPEC 01 — MVP Arcade Vault

**Estado:** Approved  
**Fecha:** 2026-09-14  
**Dependencias:** ninguna

## Objetivo

Implementar MVP visual de Arcade Vault: todas pantallas del prototype (biblioteca, detalle, player, auth, salón) en Next.js 16 App Router con diseño arcade retro completo, sin implementar lógica de juegos.

## Scope

### Incluido
- **5 rutas navegables:**
  - `/` — biblioteca juegos (home) con filtros + búsqueda
  - `/juego/[id]` — detalle juego con leaderboard
  - `/jugar/[id]` — player con CRT shell + modal Game Over mock
  - `/auth` — formulario login/registro (sin backend)
  - `/salon` — hall of fame con tabs + podium + tabla
- **Sistema diseño arcade retro:**
  - CSS Module dedicado (arcade.module.css)
  - Variables CSS custom (colores neón, fonts pixel/mono)
  - 8 covers juegos generados CSS puro
  - Efectos neon glow + flicker en títulos
- **Fonts:** Press Start 2P (pixel) + JetBrains Mono (mono) vía Google Fonts
- **Navbar:** logo, links, contador créditos, botón auth, hamburger mobile
- **Responsive:** breakpoints 840px/720px, hamburger menu, grid adapt
- **Data mock:** 8 juegos completos, categorías, seededScores helper
- **Persistencia:** localStorage para user + scores (client-only)
- **TypeScript:** strict mode, tipos completos

### NO incluido
- Implementación real de juegos (player muestra mensaje "NO IMPLEMENTADO")
- Backend auth (formulario solo visual)
- API persistence (solo localStorage)
- Animaciones background complejas (grid perspectiva, scanlines, noise)
- Card tilt 3D effect
- Fade/slide animations entrada
- Testing (se agrega en spec futura)
- Deploy config (se agrega en spec futura)

## Data Model

### Types principales (`lib/types.ts`)

```typescript
export type GameCategory = 'ARCADE' | 'PUZZLE' | 'SHOOTER' | 'VERSUS';

export interface Game {
  id: string;
  title: string;
  short: string;      // descripción breve
  long: string;       // descripción larga
  cat: GameCategory;
  cover: string;      // clase CSS cover (ej: 'cover-bricks')
  color: 'cyan' | 'magenta' | 'yellow' | 'green';
  best: number;       // mejor puntuación
  plays: string;      // ej: '12.4K'
}

export interface User {
  name: string;
  email: string;
}

export interface ScoreEntry {
  rank: number;
  name: string;
  score: number;
  date: string;
}

export interface SavedScore {
  gameId: string;
  score: number;
  at: number;         // timestamp
}
```

### Mock data (`lib/data.ts`)

- `GAMES: Game[]` — array 8 juegos (Bloque Buster, Caída, Serpentina, Glotón, Invasores, Rocas, Ranaria, Duelo Pixel)
- `CATEGORIES: string[]` — ['TODOS', 'ARCADE', 'PUZZLE', 'SHOOTER', 'VERSUS']
- `PLAYERS: string[]` — 18 nombres mock
- `seededScores(seed: string | number, count?: number): ScoreEntry[]` — genera leaderboard determinista

### localStorage keys

- `av_user` — User object serializado
- `av_scores` — SavedScore[] array

## Implementation Plan

### 1. Estructura base + configuración
- Crear route group `app/(app)/`
- Layout route group con fonts Google (Press Start 2P, JetBrains Mono)
- Actualizar root layout: quitar Geist, importar fonts arcade
- Crear `lib/types.ts` con interfaces
- Crear `lib/data.ts` con GAMES array + helpers

### 2. Sistema diseño arcade
- Extraer `references/templates/styles.css` → `styles/arcade.module.css`
- Mantener: variables CSS, covers, botones, cards, tabla, modal, CRT
- Incluir: neon glow classes, flicker animation, responsive breakpoints
- Quitar: animaciones grid perspectiva, scanlines, noise (fuera scope)
- Importar module en components que lo necesiten

### 3. Navbar component
- `components/nav.tsx` client component
- Logo (logo-mark + texto "ARCADE VAULT")
- Links: Biblioteca, Salón de la Fama (active state)
- Contador créditos fixed "03"
- Botón auth (condicional user state)
- Hamburger menu mobile con panel slide-in
- usePathname para active state
- Props: user, onSignOut

### 4. Biblioteca (home) — `/`
- `app/(app)/page.tsx`
- Hero: título "ARCADE VAULT" con flicker + subtítulo
- Filtros: searchbar + chips categorías
- Grid responsive cards juegos
- `components/game-card.tsx`:
  - Cover CSS generado (clase según game.cover)
  - Label categoría
  - Título, descripción corta
  - Badge mejor puntuación
  - Botón "JUGAR" (color según game.color)
  - onClick navega a detalle
- Estado: query búsqueda + categoría seleccionada
- Filtrado: coincidencia title + categoría

### 5. Detalle juego — `/juego/[id]`
- `app/(app)/juego/[id]/page.tsx`
- Validar id existe en GAMES (notFound si no)
- Layout 2 columnas (1.4fr 1fr), responsive stack mobile
- Columna izq: cover grande (aspect 16/10)
- Columna der:
  - Título h2 pixel
  - Tags categoría
  - Descripción larga
  - Stat strip grid 3 cols: mejor score / jugadores / categoría
  - Botones: "JUGAR AHORA", "VER SALÓN"
- Leaderboard debajo full-width:
  - Header "TOP JUGADORES"
  - 12 filas con seededScores(gameId)
  - Columnas: rank / jugador / score / fecha
  - Top 3 con colores oro/plata/bronce

### 6. Player — `/jugar/[id]`
- `app/(app)/jugar/[id]/page.tsx`
- Validar id existe (notFound si no)
- HUD arriba: score / vidas / nivel (valores mock fijos)
- Botones: Pausa, Salir
- CRT frame (border-radius, shadows, inset effects)
- CRT screen dentro:
  - Aspect ratio 4/3
  - Mensaje centrado: "JUEGO NO IMPLEMENTADO"
  - Clase pixel cyan
- CRT bottom: LED indicator "POWER" + modelo "AV-2600"
- Modal Game Over (estado local showModal):
  - Trigger: botón "Simular Game Over" en HUD
  - Overlay fondo dark
  - Modal card magenta border + glow
  - Título "GAME OVER" pixel
  - Score final mock (ej: 42680)
  - Input nombre jugador
  - Botones: "GUARDAR Y SALIR", "JUGAR DE NUEVO"
  - Toast "Score guardado" después guardar

### 7. Auth — `/auth`
- `app/(app)/auth/page.tsx`
- Card centrado (max-width 440px)
- Header: logo-mark + título "ARCADE VAULT"
- Tabs: "INICIAR SESIÓN" / "REGISTRARSE"
- Fields:
  - Email (ambos tabs)
  - Contraseña (ambos tabs)
  - Nombre (solo registro)
- Botón primario cyan: "ENTRAR" / "CREAR CUENTA"
- Divider "O CONTINUAR CON"
- Botones sociales grid 2 cols: Google, Discord
- Submit: guardar user en localStorage, navegar biblioteca
- Sin validación real backend

### 8. Salón fama — `/salon`
- `app/(app)/salon/page.tsx`
- Header: título gradient "SALÓN DE LA FAMA" + subtítulo
- Tabs juegos (chips): selecciona gameId activo
- Podium grid 3 cols (responsive stack mobile):
  - Slot oro centro (más alto): rank #01
  - Slot plata izq: rank #02
  - Slot bronce der: rank #03
  - Cada slot: rank num, nombre, score, fecha
- Tabla completa debajo:
  - Header: RANGO / JUGADOR / PUNTUACIÓN / FECHA
  - 12 filas seededScores(gameId)
  - Top 3 con colores especiales
  - Si user logged: fila extra "TU MEJOR MARCA" con score mock
- Botón "VOLVER A LA BIBLIOTECA"

### 9. Integración navegación
- Navbar en layout grupo con client boundary
- User state: Context provider o prop drilling desde root layout client wrapper
- localStorage helpers: `lib/storage.ts`
  - getUser() / saveUser() / clearUser()
  - getScores() / saveScore()
- Link components Next.js para navegación
- Sign out: clear localStorage + navegar home

### 10. Responsive final pass
- Verificar breakpoints 840px (hamburger, hide contador) y 720px (tabla compact)
- Grid biblioteca: auto-fill minmax(280px, 1fr)
- Detalle: stack columnas <900px
- Tabla salón: ajustar cols mobile (50px 1fr 90px 90px)
- Padding lateral ajustado mobile (32px → 16px)

### 11. Polish efectos neon
- Text-shadow neon en:
  - Logo navbar
  - Títulos pixel principales
  - Scores (cyan glow)
  - Ranks oro/plata/bronce
- Flicker animation en hero title (keyframes 5s steps)
- Botones: border glow on hover
- Verificar contraste accesible

### 12. Verificación completa
- Navegar todas rutas manualmente
- Filtros biblioteca: query + categoría
- Detalle: validar notFound
- Player: modal show/hide
- Auth: tabs switch, form submit mock
- Salón: tabs juegos, podium + tabla
- Mobile: abrir hamburger, responsive layouts
- Efectos: neon visible, flicker funciona
- TypeScript: no errores compilación

## Acceptance Criteria

- [ ] Ruta `/` muestra biblioteca 8 juegos con covers CSS
- [ ] Filtros búsqueda + categoría funcionan
- [ ] Click card navega `/juego/[id]` correcto
- [ ] Detalle muestra info juego + leaderboard 12 filas
- [ ] Botón "JUGAR AHORA" navega `/jugar/[id]`
- [ ] Player muestra CRT + mensaje "NO IMPLEMENTADO"
- [ ] Modal Game Over aparece, acepta nombre, simula guardar
- [ ] `/auth` muestra tabs login/registro, submit guarda user localStorage
- [ ] `/salon` muestra podium + tabla, tabs juegos switch data
- [ ] Navbar: logo navega home, links active state, auth button toggle user
- [ ] Mobile <840px: hamburger menu funciona, layouts stack
- [ ] Efectos neon visibles en títulos, scores, botones
- [ ] Flicker animation en hero title
- [ ] TypeScript compila sin errores
- [ ] No warnings console en runtime

## Decisiones Tomadas

1. **TypeScript strict:** mantener consistencia proyecto, mejor DX
2. **CSS Module:** arcade.module.css preserva diseño cohesivo original, Tailwind solo extra
3. **Fonts template:** Press Start 2P + JetBrains Mono mantienen estética arcade retro vs Geist moderno
4. **Client Components:** interactividad (filters, state, localStorage) requiere 'use client'
5. **Route group `(app)`:** estructura propuesta usuario, agrupa rutas app vs posibles admin/api futuras
6. **localStorage original:** suficiente MVP, migrar backend spec futura
7. **Player CRT vacío:** cumple "solo visual", juegos fuera scope
8. **Solo efectos neon:** omitir grid/scanlines/noise reduce complejidad sin perder identidad
9. **Covers CSS completos:** arte distintivo, ya implementados
10. **Responsive completo:** template ya resuelto, copy breakpoints
11. **Modal Game Over:** completa flujo visual player
12. **8 juegos mock:** data completa prueba filtros, detalle, salón

## Decisiones Descartadas

- **Migrar todo a Tailwind:** perdería diseño cohesivo arcade, covers CSS complejos difíciles en utility-first
- **JavaScript/JSX:** proyecto ya TypeScript, inconsistencia
- **Mix Server/Client:** complejidad innecesaria MVP visual
- **Rutas planas sin grupo:** grupo permite futuras admin routes, preferencia usuario
- **React Context user:** overkill MVP, prop drilling suficiente
- **Sin persistencia:** rompe flujo auth visual
- **Demo animation fake player:** más trabajo, "vacío + mensaje" cumple spec
- **Todas animaciones background:** grid/scanlines fuera scope usuario
- **Simplificar covers:** perdería identidad visual
- **Desktop only:** template responsive ya hecho
- **Omitir modal:** incompleta experiencia player
- **Reducir juegos mock:** 8 necesarios probar filtros categorías

## Riesgos Identificados

1. **Next.js 16 breaking changes:** leer docs antes escribir código (ya en AGENTS.md)
2. **CSS Module + Tailwind conflict:** namespacing module evita, verificar build
3. **localStorage SSR:** usar solo client-side (useEffect), verificar hydration
4. **Covers CSS complejos responsive:** probar mobile cuidadosamente
5. **Fonts Google carga:** preconnect + display=swap evitar FOIT
6. **Route group primer deploy:** verificar build paths correctos
