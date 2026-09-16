# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arcade Vault: plataforma online para juegos arcade con sistema de puntuación competitiva.

## Skills

Usa siempre /frontend-design para diseñar la interfaz de usuario

## Architecture

### Next.js App Router (16.3.5)

- **CRÍTICO**: Next.js 16+ tiene breaking changes vs training data
- Antes de escribir código: leer `node_modules/next/dist/docs/` relevante
- App Router en `/app` (no `pages/`)
- TypeScript + React Server Components por defecto

### Path Aliases

```typescript
@/* → raíz proyecto (ej: @/app/page.tsx)
```

### Stack

- Next.js 16.3.5 + React 19
- TypeScript strict mode
- Tailwind CSS 4 (PostCSS)
- ESLint con config Next.js

## Spec Driven Design

Proyecto sigue Spec Driven Design:

1. Usar `/spec` para crear especificación antes de implementar
2. Usar `/spec-impl` para implementar desde spec
3. Skills base: `npx skills@latest add Klerith/fernando-skills`

Referencia: https://github.com/Klerith/fernando-skills

## Project Structure

```
app/
  layout.tsx    # Root layout con Geist fonts
  page.tsx      # Home page
  globals.css   # Tailwind + estilos globales
```

## Development Commands

```bash
npm run dev          # Dev server (puerto 3000)
npm run build        # Build producción
npm run start        # Start producción
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
npm run format:check # Prettier check sin modificar
```

## Key Patterns

- **Fuentes**: Geist Sans + Geist Mono (Google Fonts)
- **Tema**: Dark mode via className dark:
- **Layout**: Flexbox con min-h-full responsive
- **Imágenes**: next/image con lazy loading

## Config

- `.spec-config.yml`: AutoCreateBranch habilitado → `/spec-impl` crea rama automáticamente
- ESLint 9 + Prettier integrados
- TypeScript strict mode con paths alias `@/*`

@AGENTS.md
