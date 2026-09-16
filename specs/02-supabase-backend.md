# SPEC 02 — Backend Supabase

**Estado:** Aprobado  
**Fecha:** 2026-09-15  
**Dependencias:** SPEC 01

## Objetivo

Migrar autenticación, usuarios y puntuaciones de localStorage a Supabase con Auth (email/password), tablas users/scores con RLS, y mantener juegos hardcoded.

## Scope

### Incluido

- **Supabase setup:**
  - Crear proyecto Supabase nuevo
  - Configurar env vars (.env.local)
  - Setup cliente @supabase/ssr en Next.js 16
- **Auth Supabase:**
  - Email/password signup + login
  - Session management automático
  - Modificar `/auth` para usar Supabase Auth (quitar botones OAuth de la UI)
- **Schema DB:**
  - Tabla `users` (id uuid = auth.users.id, name, created_at) — el email vive solo en `auth.users`
  - Tabla `scores` (id, user_id FK NOT NULL, game_id text, score int, created_at)
  - RLS policies: SELECT público en `users` y `scores`, INSERT solo el propio auth user
- **Migrations:** 2 archivos SQL (01_create_users.sql, 02_create_scores.sql)
- **Client integration:**
  - lib/supabase.ts (cliente browser)
  - Refactor components: usar Supabase queries en lugar de localStorage
  - Modal Game Over: INSERT score real
  - Leaderboards: SELECT desde tabla scores
- **Testing:**
  - Integration tests Playwright: signup, login, play, save score, ver leaderboard
  - Verificación manual flujo completo
- **Eliminar localStorage:** quitar av_user, av_scores (mantener limpio)

### NO incluido

- **OAuth (Google / Discord): descartado por decisión del usuario, solo email/password**
- Migrar array GAMES a DB (sigue hardcoded lib/data.ts)
- Realtime subscriptions (leaderboards fetch estático)
- API Routes Next.js (client directo a Supabase)
- Admin panel juegos (spec futura)
- Migración datos localStorage existentes (empezar limpio)
- Profile editable (solo name en signup)
- Email verification (signup directo sin confirm)
- Password reset flow (spec futura)

## Data Model

### Tabla `users`

El `id` referencia `auth.users(id)`. El email NO se duplica aquí: vive en `auth.users`, accesible vía sesión.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- SELECT público: el leaderboard necesita el name de cualquier user.
-- Seguro porque la tabla no contiene datos sensibles (email queda en auth.users).
CREATE POLICY "Users readable by all"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Tabla `scores`

```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para queries leaderboard
CREATE INDEX idx_scores_game_id ON scores(game_id);
CREATE INDEX idx_scores_game_score ON scores(game_id, score DESC);
CREATE INDEX idx_scores_user_id ON scores(user_id);

-- RLS policies
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scores readable by all"
  ON scores FOR SELECT
  USING (true);

CREATE POLICY "Users insert own scores"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Types TypeScript actualizados (`lib/types.ts`)

```typescript
// Mantener tipos existentes Game, GameCategory, etc.

// Reemplazar User interface
// Fila de la tabla users. El email no está aquí: se lee de la sesión de auth.
export interface User {
  id: string; // UUID Supabase (= auth.users.id)
  name: string;
  created_at: string;
}

// Actualizar ScoreEntry para DB
export interface DbScore {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  created_at: string;
}

// Para leaderboard display
export interface LeaderboardEntry {
  rank: number;
  user_name: string;
  score: number;
  date: string;
}
```

### Supabase client (`lib/supabase.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Variables entorno (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

## Implementation Plan

### 1. Setup proyecto Supabase

- Crear proyecto en supabase.com (región más cercana)
- Copiar Project URL + anon public key
- Crear `.env.local` con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
- Agregar `.env*.local` a .gitignore (verificar ya existe)

### 2. Configurar Auth email/password

- Supabase dashboard → Authentication → Providers → Email habilitado
- Desactivar "Confirm email" (signup directo, sin verificación)
- URL Configuration → Site URL: `http://localhost:3000`
- No se configura ningún provider OAuth

### 3. Migrations schema

- Crear `supabase/migrations/20260915000001_create_users.sql`:
  - Tabla users (id FK auth.users, name, created_at)
  - RLS enable + policies (read all, insert own)
- Crear `supabase/migrations/20260915000002_create_scores.sql`:
  - Tabla scores (id, user_id FK, game_id, score, created_at)
  - Índices (game_id, game_id+score DESC, user_id)
  - RLS enable + policies (read all, insert own)
- Aplicar migrations vía Supabase SQL Editor (dashboard)

### 4. Instalar dependencias

- `npm install @supabase/ssr`
- Verificar compatible Next.js 16.3.5 (check peer dependencies)

### 5. Cliente Supabase

- Crear `lib/supabase.ts`:
  - `createBrowserClient` con env vars
  - Export singleton `supabase`
- Actualizar `lib/types.ts`:
  - Interface User con id UUID
  - Interface DbScore
  - Interface LeaderboardEntry

### 6. Refactor Auth page

- `app/(app)/auth/page.tsx`:
  - Mantener UI (tabs, fields, botones)
  - **Login tab:** `supabase.auth.signInWithPassword({ email, password })`
  - **Signup tab:**
    - `supabase.auth.signUp({ email, password })`
    - Después signup exitoso: INSERT en tabla users `{ id: user.id, name }`
  - **Quitar botones OAuth** (Google/Discord) de la UI y su separador
  - Success: redirect `/` (biblioteca)
  - Errors: toast con mensaje error

### 7. (eliminado — callback route solo era necesaria para OAuth)

### 8. Auth state global

- Crear `lib/auth-context.tsx`:
  - Context provider con `supabase.auth.getSession()` inicial
  - `supabase.auth.onAuthStateChange()` listener
  - State: user (User | null), loading
  - Export useAuth hook
- Wrap layout `app/(app)/layout.tsx` con AuthProvider
- Navbar: usar useAuth en lugar de localStorage

### 9. Refactor leaderboard queries

- Crear `lib/queries.ts`:
  - `getLeaderboard(gameId: string): Promise<LeaderboardEntry[]>`
    - `SELECT scores.*, users.name FROM scores JOIN users ON scores.user_id = users.id WHERE game_id = $1 ORDER BY score DESC LIMIT 100`
    - Map a LeaderboardEntry con rank
- `app/(app)/juego/[id]/page.tsx`:
  - useEffect fetch `getLeaderboard(id)` on mount
  - Reemplazar `seededScores` mock con data real
  - Loading state mientras fetch
- `app/(app)/salon/page.tsx`:
  - Similar, fetch leaderboard por gameId activo
  - Podium top 3, tabla resto

### 10. Refactor save score

- Modal Game Over en `app/(app)/jugar/[id]/page.tsx`:
  - Botón "GUARDAR Y SALIR":
    - Verificar user auth (useAuth), si no → redirect `/auth`
    - `INSERT INTO scores (user_id, game_id, score) VALUES (auth.uid(), $1, $2)`
    - Success toast "Score guardado"
    - Redirect `/juego/[id]` (ver en leaderboard)
- Quitar código localStorage scores

### 11. Eliminar localStorage helpers

- Borrar `lib/storage.ts` (o comentar export si se reutiliza)
- Buscar `localStorage.getItem('av_user')` / `localStorage.setItem('av_scores')` en codebase
- Quitar todos los usos
- Verificar no quedan referencias

### 12. Testing Playwright

- Crear `tests/auth-flow.spec.ts`:
  - Test signup: llenar form, submit, verificar redirect biblioteca + user logged navbar
  - Test login: llenar form, submit, verificar session
  - Test logout: click botón, verificar user null
- Crear `tests/scores-flow.spec.ts`:
  - Test save score: login, navegar jugar, modal Game Over, save, verificar aparece en leaderboard
  - Test leaderboard: verificar tabla carga, top 3 podium
- Ejecutar `npx playwright test`
- Todos tests pasan antes marcar spec Implemented

### 13. Verificación manual completa

- Signup nuevo user (email + password)
- Login con ese user
- Jugar juego → guardar score → ver en leaderboard detalle
- Ver salón fama → tabs juegos → verificar scores
- Logout → verificar navbar cambia
- Revisar Supabase dashboard: tabla users tiene registros, tabla scores tiene scores
- Verificar RLS: intentar INSERT score sin auth → debe fallar

### 14. Documentación

- Actualizar README.md sección "Setup":
  - Clonar repo
  - `npm install`
  - Crear `.env.local` con keys Supabase (template)
  - `npm run dev`
- Agregar sección "Supabase Setup":
  - Crear proyecto
  - Aplicar migrations (SQL Editor)
  - Habilitar Email provider sin confirm email
- Commit y push

## Acceptance Criteria

- [ ] Proyecto Supabase creado, URL + anon key en .env.local
- [ ] Auth email/password habilitado en Supabase dashboard, sin confirm email
- [ ] Migrations aplicadas: tablas users y scores existen con RLS
- [ ] @supabase/ssr instalado, lib/supabase.ts funciona
- [ ] Signup email/password crea user en auth + tabla users
- [ ] Login email/password establece session, navbar muestra user
- [ ] UI de `/auth` sin botones Google/Discord
- [ ] Logout limpia session, navbar muestra "ENTRAR"
- [ ] Modal Game Over guarda score en tabla scores (INSERT)
- [ ] Leaderboard juego carga scores reales desde DB
- [ ] Salón fama tabs cargan leaderboards por game_id
- [ ] Top 3 podium muestra scores correctos
- [ ] User sin auth no puede guardar score (RLS bloquea)
- [ ] Tests Playwright signup + login + save score + leaderboard pasan
- [ ] No quedan referencias localStorage av_user / av_scores
- [ ] TypeScript compila sin errores
- [ ] No warnings console runtime
- [ ] README documenta setup Supabase

## Decisiones Tomadas

1. **Supabase vs otros backends:** Supabase elegido por Auth integrado, RLS, PostgreSQL, realtime futuro posible
2. **@supabase/ssr:** recomendado Next.js 13+, maneja cookies server/client
3. **Client directo (no API routes):** RLS suficiente seguridad, menos código
4. **FK user_id NOT NULL:** solo users autenticados guardan scores, evita spam
5. **RLS read all scores:** leaderboards públicos, competitivo
6. **Sin OAuth:** decisión del usuario (2026-09-16) — solo email/password; se retiran los botones Google/Discord que venían de spec 01
7. **No email verification:** signup directo, UX más rápido MVP
8. **Mantener GAMES hardcoded:** migrar a DB es scope diferente, no crítico ahora
9. **No realtime leaderboards:** fetch estático suficiente MVP, realtime es spec futura
10. **Tests Playwright:** ya mencionado en spec 01 como futuro, integrar ahora
11. **Ignorar localStorage actual:** empezar limpio, no migrar datos dev
12. **Índice game_id + score DESC:** query leaderboard rápida, crítico para UX
13. **`users` con SELECT público y sin columna email (2026-09-16):** el leaderboard hace JOIN a users para mostrar el name; con RLS "read own" los nombres ajenos saldrían vacíos. Se abre el SELECT y se saca el email de la tabla (queda solo en `auth.users`) para no exponer datos sensibles

## Decisiones Descartadas

- **IndexedDB:** innecesario con backend real
- **API Routes Next.js:** overengineering, RLS suficiente
- **Supabase Realtime:** añade complejidad, fetch estático suficiente MVP
- **Tabla games en DB:** mantener hardcoded más simple ahora, posible spec futura admin
- **Password reset flow:** fuera scope MVP, agregar después si necesario
- **Email confirmation:** ralentiza signup, omitir MVP
- **Profile editable:** solo name en signup, editar profile es spec futura
- **Migración localStorage:** no hay datos prod, empezar limpio
- **Multiple scores per user per game:** solo un score, simplifica leaderboard (futuro: history)
- **Soft delete scores:** hard delete CASCADE suficiente
- **Avatars users:** solo name, avatars es enhancement futuro
- **OAuth Google / Discord:** descartado, dependencia externa innecesaria para el MVP

## Riesgos Identificados

| Riesgo                                                 | Mitigación                                                                                |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Next.js 16 breaking changes con @supabase/ssr          | Leer docs @supabase/ssr + Next.js 16, verificar ejemplos oficiales compatibles            |
| RLS policies incorrectas permiten acceso no autorizado | Test manual + Playwright verificar user sin auth no puede INSERT scores                   |
| Session no persiste después refresh                    | @supabase/ssr maneja cookies automático, verificar getSession en AuthProvider             |
| Leaderboard query lenta con muchos scores              | Índices compuestos (game_id, score DESC), LIMIT 100 suficiente MVP                        |
| TypeScript errores tipos Supabase                      | Usar `supabase gen types typescript` generar tipos auto (opcional, manual suficiente MVP) |
