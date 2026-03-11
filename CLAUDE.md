# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-polygon editor library for React Native Maps (`react-native-maps`). Supports Apple Maps, Google Maps, and web. Published as `@siposdani87/expo-maps-polygon-editor` on npm.

## Commands

- **Build:** `npm run build` (cleans `dist/`, then compiles TypeScript)
- **Lint:** `npm run lint` (ESLint on `.ts`/`.tsx` files)
- **Lint fix:** `npm run lint:fix`
- **Format:** `npm run format` (Prettier on `src/**/*.ts*`)
- **No tests** — `npm test` is a no-op placeholder.

## Architecture

The library exports a single `PolygonEditor` React component (via `forwardRef`) and supporting types/utilities from `src/index.ts`.

### Key Modules

- **`src/PolygonEditor.tsx`** — Main component. Manages polygon selection, creation, editing, and removal. Exposes imperative methods via `PolygonEditorRef` (`setCoordinate`, `startPolygon`, `selectPolygonByKey`, `selectPolygonByIndex`, `resetAll`). All event handlers are wrapped with `useCallback`.
- **`src/hooks/`** — State management hooks used by PolygonEditor: `useSelectedKey`, `useSelectedMarker`, `useNewPolygon`, `usePolygonFinder`, `useDisabled`.
- **`src/components/`** — Visual sub-components: `Polygons`, `Polyline`, `CircleMarkers` (vertex handles), `SubCircleMarkers` (midpoint handles), `Circle`, `RemoverCircle`.
- **`src/lib/geospatials.ts`** — Turf.js wrappers for point-in-polygon checks and midpoint calculations. Uses `@turf/boolean-point-in-polygon`, `@turf/helpers`, `@turf/midpoint`.
- **`src/lib/helpers.ts`** — Coordinate manipulation utilities (`addCoordinateToPolygon`, `getMiddleCoordinates`).
- **`src/lib/types.ts`** — Core types: `MapPolygonExtendedProps` (extends `MapPolygonProps` with `key`), `PolygonEditorRef`, `PolygonKey`.
- **`src/lib/colors.ts`** — `getRandomPolygonColors()` utility for generating stroke/fill color pairs.
- **`src/web/`** — Web platform shims (`MapView`, `Marker`, `Polygon`) that replace `react-native-maps` on web. Typed with `@types/google.maps`. Shared global declaration in `src/web/types.ts`.

### Build Output

TypeScript compiles `src/` to `dist/` with declarations and declaration maps. Entry point is `dist/index.js` (configured in `package.json` `main` and `exports`).

### Example App

The `example/` directory contains a standalone Expo SDK 54 app demonstrating usage. It has its own `node_modules` and config. The `metro.config.js` handles monorepo resolution and web platform redirection via `react-native-maps-web.tsx`.

## Code Style

- Prettier: 4-space tabs, single quotes, trailing commas, semicolons (`.prettierrc.json`).
- ESLint: `@react-native-community` config with `@typescript-eslint` parser.
- Strict TypeScript: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- No `any` types in library source — use proper types throughout.

## Branching

- `master` is the main/release branch.
- `develop` is the development branch.

## CI/CD

- **CI:** Runs lint + build on PRs and pushes to `develop`/`master` (`.github/workflows/ci.yml`).
- **Publish:** Runs lint + build + `npm publish` on pushes to `master` (`.github/workflows/npm-publish.yml`).