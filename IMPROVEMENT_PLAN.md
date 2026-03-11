# Improvement Plan (Expo SDK 54)

## Phase 1 — Bug Fixes (Library)

### 1.1 Fix shared module-level debounce (`src/lib/helpers.ts`)

- [x] The `timeout` variable is module-scoped — all `PolygonEditor` instances share it. If two editors exist, one's drag end can cancel the other's.
- **Fix:** Remove the module-level `debounce`. Instead, use a `useRef<NodeJS.Timeout>` inside `PolygonEditor.tsx` and inline the setTimeout/clearTimeout logic in `onMarkerDragEnd`.

### 1.2 Fix `PolygonPressEvent` typed as `any` (`src/components/Polygons.tsx:5`)

- [x] `export type PolygonPressEvent = any;` — should be a proper type with at minimum `{ stopPropagation: () => void }`, matching what `react-native-maps` Polygon `onPress` provides and what the web shim creates.

### 1.3 Dead code in `CircleMarkers` (`src/components/CircleMarkers.tsx:44`)

- [x] `size={isSelectedMarker(coordIndex) ? 15 : 8}` — the `isSelectedMarker(coordIndex)` branch (size 15) is unreachable because the `Circle` only renders when `!isSelectedMarker(coordIndex)`. Always passes size 8.
- **Fix:** Simplify to `size={8}`.

## Phase 2 — Library Improvements

### 2.1 Eliminate unnecessary `usePolygons` hook (`src/hooks/usePolygons.ts`)

- [x] This hook just mirrors prop state into local state via `useEffect`. It causes an extra render cycle and is an anti-pattern — the parent-provided `polygons` prop is already reactive.
- **Fix:** Remove `usePolygons` and use `props.polygons` directly in `PolygonEditor.tsx`.

### 2.2 Stabilize callback references in `PolygonEditor.tsx`

- [x] Many event handlers (e.g., `onPolygonClick`, `onMarkerDrag`, `onSubMarkerDragStart`) are recreated every render, causing unnecessary re-renders of child components.
- **Fix:** Wrap key handlers with `useCallback` and memoize child components where impactful.

### 2.3 Tighten peer dependency versions (`package.json`)

- [x] All peer deps use `"*"`. Consumers get no guidance on compatible versions.
- **Fix:** Set minimum versions: `react >= 18`, `react-native >= 0.72`, `react-native-maps >= 1.14`, `@turf/* >= 6.5`.

### 2.4 Update `tsconfig.json` moduleResolution

- [x] Change `"moduleResolution": "Node"` → `"moduleResolution": "Bundler"` — better aligns with Metro/modern RN tooling.

## Phase 3 — Example App Fixes & Improvements

### 3.1 Fix typo (`example/App.tsx:206`)

- [x] `actionsContaiener` → `actionsContainer`

### 3.2 Fix `newPolygon` mutation anti-pattern (`example/App.tsx:74-79`)

- [x] `createNewPolygon()` directly mutates module-level `newPolygon.strokeColor`/`newPolygon.fillColor`. This is a React anti-pattern and can cause stale data.
- **Fix:** Move `newPolygon` into component state, or create a fresh object each time `createNewPolygon` is called and pass it to the editor.

### 3.3 Fix `useEffect` dependency warnings (`example/App.tsx`)

- [x] Line 142-148: `useEffect` calls `selectPolygonByIndex`/`selectPolygonByKey` without them in deps.
- [x] Line 150-152: `useEffect` calls `fitToCoordinates` without it in deps.
- **Fix:** Use refs for the imperative calls to avoid stale closures, or restructure to use proper deps.

### 3.4 Remove deprecated config (`example/app.config.js`)

- [x] `updates.fallbackToCacheTimeout` is deprecated in SDK 54.
- [x] `assetBundlePatterns` is deprecated — no longer needed.
- **Fix:** Remove both fields.

### 3.5 Remove `eject` script (`example/package.json:25`)

- [x] `npx expo eject` was removed in SDK 46. Dead script.

### 3.6 Make example `private: true` (`example/package.json:8`)

- [x] Currently `"private": false` — an example app shouldn't be publishable.

## Phase 4 — Web Platform Improvements

### 4.1 Duplicate `Window` global declaration

- [x] Both `src/web/MapView.tsx` and `src/web/Polygon.tsx` declare `interface Window { google: any }`.
- **Fix:** Move to a single `src/web/types.ts` file.

### 4.2 ~~Use `@googlemaps/js-api-loader` instead of manual script injection~~ (Deferred)

- Deferred — current manual approach already guards against double-loading (`window.google.maps` check). Adding a dependency for marginal benefit would increase bundle size for all consumers.

### 4.3 Add Google Maps types

- [x] Currently uses `any` extensively for Google Maps objects. Adding `@types/google.maps` as a dev dependency would catch type errors and improve DX.

## Phase 5 — CI/CD & GitHub (from expo-rich-text-editor patterns)

### 5.1 Upgrade GitHub Actions (`npm-publish.yml`)

- [x] Current workflow uses Node 16, `actions/checkout@v3`, `actions/setup-node@v3` with no pre-publish validation
- **Fix:** Upgrade to Node 20 LTS, `actions/checkout@v4`, `actions/setup-node@v4`
- [x] Add lint + type-check + build steps before `npm publish`

### 5.2 Add CI workflow for PRs

- [x] Add a separate CI workflow that runs on PRs and pushes to `develop`/`master`
- Steps: `npm ci` → `npm run lint` → `npm run build`

### 5.3 Add GitHub templates

- [x] README references issue templates but `.github/` only contains the publish workflow
- **Fix:** Add `.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md`, `.github/PULL_REQUEST_TEMPLATE.md`

## Phase 6 — Package Modernization (from expo-rich-text-editor patterns)

### 6.1 Add `exports` field to `package.json`

- [x] Currently only has `"main"` and `"typings"`. Modern consumers benefit from conditional exports.
- **Fix:** Add `exports` field with `types`, `require`, and `import` conditions.

### 6.2 Add `sideEffects: false`

- [x] Enables tree-shaking for bundlers. The library is side-effect free.

### 6.3 Add `engines` field

- [x] **Fix:** Add `"engines": { "node": ">=18" }` to `package.json`.

### 6.4 Add `declarationMap: true` to `tsconfig.json`

- [x] Enables "Go to Definition" to jump to `.ts` source instead of `.d.ts` files in consumers' IDEs.

### 6.5 Add `.nvmrc`

- [x] **Fix:** Add `.nvmrc` with `20` for consistent Node version across contributors.

## Phase 7 — Community & Docs (from expo-rich-text-editor patterns)

### 7.1 Add SDK compatibility table to README

- [x] Document supported SDK versions, React/RN versions, and platform support (iOS, Android, Web).
- [x] Explicitly state New Architecture support status.

### 7.2 Add `CONTRIBUTING.md`

- [x] Dev setup, PR process, how to run the example app locally.

## Phase 8 — Narrow `any` Types (from expo-rich-text-editor patterns)

### 8.1 Library source `any` types

- [x] `src/PolygonEditor.tsx:54` — `ref: any` → proper `React.Ref<PolygonEditorRef>`
- [x] `src/components/Polygons.tsx:5` — `PolygonPressEvent = any` (already in Phase 1.2)

### 8.2 Web shim `any` types (combines with Phase 4.3)

- [x] `src/web/MapView.tsx` — `map: any`, `mapRef: useRef<any>` → use `google.maps.Map`
- [x] `src/web/Marker.tsx` — `markerRef: useRef<any>`, `overlayRef: useRef<any>`, all Google Maps objects typed as `any`
- [x] `src/web/Polygon.tsx` — `polygonRef: useRef<any>`, `listenerRef: useRef<any>`
- **Fix:** Add `@types/google.maps` as devDependency and replace `any` with proper Google Maps types

## Phase 9 — Developer Experience (from expo-rich-text-editor patterns)

### 9.1 Add pre-commit hooks (husky + lint-staged)

- [x] Automatically run lint and format on staged files before each commit.
- **Setup:** `husky` for git hooks, `lint-staged` for running ESLint + Prettier on `src/**/*.{ts,tsx}`.

### 9.2 Add commitlint with conventional commits

- [x] Enforce consistent commit message format (`feat:`, `fix:`, `chore:`, etc.).
- **Setup:** `@commitlint/cli` + `@commitlint/config-conventional`, husky `commit-msg` hook.

### 9.3 Add `typesVersions` to `package.json`

- [x] Fallback for older TypeScript consumers that don't support `exports`.
- **Fix:** Add `"typesVersions": { "*": { "*": ["dist/index.d.ts"] } }`.

## Phase 10 — Community Docs (from expo-rich-text-editor patterns)

### 10.1 Add `CODEOWNERS`

- [x] Automatic PR review assignment on GitHub.
- **Fix:** Add `.github/CODEOWNERS` with `* @siposdani87`.

### 10.2 Add `CODE_OF_CONDUCT.md`

- [x] Standard Contributor Covenant for open source projects.

### 10.3 Add `SECURITY.md`

- [x] Vulnerability reporting policy.

## Phase 11 — Automated Changelog & Releases

### 11.1 Adopt conventional changelog generation

- [x] Use `standard-version` or `release-please` to auto-generate `CHANGELOG.md` from conventional commits.
- **Setup:** Add `release` script to `package.json`. Migrate existing CHANGELOG format to Keep a Changelog / Conventional Changelog.

### 11.2 Add `release` npm script

- [x] `npm run release` should bump version, update CHANGELOG, create git tag, and optionally push.

## Phase 12 — Testing (Medium-Long Term)

### 12.1 Add unit tests for utility functions

- [x] Test `src/lib/geospatials.ts` (point-in-polygon, midpoint calculations).
- [x] Test `src/lib/helpers.ts` (addCoordinateToPolygon, getMiddleCoordinates).
- [x] Test `src/lib/colors.ts` (getRandomPolygonColors).
- **Setup:** Add `jest` + `@types/jest`, configure in `package.json`.

### 12.2 Add hook tests

- [ ] Test `useSelectedKey`, `useSelectedMarker`, `useNewPolygon`, `usePolygonFinder`, `useDisabled`.
- **Setup:** Add `@testing-library/react-hooks` or use React Testing Library.

### 12.3 Add CI step for test execution

- [x] Add `npm test` step to CI workflow after lint and build.

## Execution Order

| Step | What | Risk | Files |
| ---- | ---- | ---- | ----- |
| 1 | ~~Fix shared debounce bug~~ | Low | `src/lib/helpers.ts`, `src/PolygonEditor.tsx` |
| 2 | ~~Fix dead Circle size code~~ | Low | `src/components/CircleMarkers.tsx` |
| 3 | ~~Type `PolygonPressEvent` properly~~ | Low | `src/components/Polygons.tsx` |
| 4 | ~~Remove `usePolygons` wrapper~~ | Medium | `src/hooks/usePolygons.ts`, `src/PolygonEditor.tsx`, `src/hooks/index.ts` |
| 5 | ~~Example app fixes (typo, mutation, deps, deprecated config, eject, private)~~ | Low | `example/App.tsx`, `example/app.config.js`, `example/package.json` |
| 6 | ~~Tighten peer deps + `exports` + `sideEffects` + `engines`~~ | Low | `package.json` |
| 7 | ~~Update `tsconfig.json` (`moduleResolution`, `declarationMap`)~~ | Low | `tsconfig.json` |
| 8 | ~~Upgrade GitHub Actions + add CI workflow~~ | Low | `.github/workflows/` |
| 9 | ~~Add GitHub templates~~ | Low | `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md` |
| 10 | ~~Add `.nvmrc`~~ | Low | `.nvmrc` |
| 11 | ~~Narrow `any` types in library source~~ | Medium | `src/PolygonEditor.tsx`, `src/lib/helpers.ts` |
| 12 | ~~Web platform cleanup (types, narrow `any`)~~ | Medium | `src/web/*.tsx` |
| 13 | ~~Add SDK compatibility table + `CONTRIBUTING.md`~~ | Low | `README.md`, `CONTRIBUTING.md` |
| 14 | ~~Stabilize callbacks with `useCallback` (2.2)~~ | Medium | `src/PolygonEditor.tsx` |
| 15 | ~~Pre-commit hooks (husky + lint-staged)~~ | Low | `package.json`, `.husky/` |
| 16 | ~~Commitlint (conventional commits)~~ | Low | `commitlint.config.js`, `.husky/commit-msg` |
| 17 | ~~`typesVersions` in package.json~~ | Low | `package.json` |
| 18 | ~~Community docs (CODEOWNERS, CODE_OF_CONDUCT, SECURITY)~~ | Low | `.github/CODEOWNERS`, root docs |
| 19 | ~~Automated changelog (standard-version)~~ | Low | `package.json`, `CHANGELOG.md` |
| 20 | Unit tests for utilities and hooks | Medium | `src/lib/__tests__/`, `src/hooks/__tests__/` |
