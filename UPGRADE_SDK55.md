# Upgrade Plan: Expo SDK 54 → SDK 55

## Overview

Upgrade the library and example app from Expo SDK 54 to SDK 55. This is a significant upgrade due to the **mandatory New Architecture** requirement — SDK 55 drops Legacy Architecture support entirely.

## Key Changes in SDK 55

- **React Native** 0.81.5 → **0.83.2**
- **React** 19.1.0 → **19.2.x**
- **New Architecture is mandatory** — `newArchEnabled` config option removed
- **Node.js** minimum: ^20.19.4, ^22.13.0, ^24.3.0, or ^25.0.0
- Hermes v1 with performance improvements
- Minimum Android API 36, minimum iOS 15.1, minimum Xcode 26

## Pre-Upgrade Checklist

- [x] Verify Node.js version is compatible (^20.19.4+) — **v24.13.1 already installed**
- [ ] Enable New Architecture on SDK 54 first and verify everything works
- [ ] Create a dedicated branch for the upgrade (`feature/sdk-55-upgrade`)
- [ ] Back up `ios/` and `android/` directories in example app

## Phase 1 — Enable New Architecture on SDK 54 (Pre-Upgrade)

### 1.1 Enable New Architecture in example app

- [ ] Remove `newArchEnabled: false` from `example/app.config.js` (currently on line 18)
- [ ] Run `npx expo prebuild --clean` for both platforms
- [ ] Test on iOS simulator and Android emulator
- [ ] Fix any New Architecture incompatibilities

### 1.2 Verify react-native-maps compatibility

- [ ] Test `react-native-maps@1.20.1` with New Architecture on SDK 54
- [ ] Check if maps render correctly on iOS (Apple Maps)
- [ ] Check if maps render correctly on Android (Google Maps)
- [ ] Check if polygon editing works on both platforms
- [ ] Test web platform still works

## Phase 2 — Upgrade Library (package.json)

### 2.1 Update peer dependencies

```json
"react": ">=19.0.0"          // was >=18.0.0
"react-dom": ">=19.0.0"      // was >=18.0.0
"react-native": ">=0.83.0"   // was >=0.72.0
"react-native-maps": ">=1.20.0" // was >=1.14.0
```

### 2.2 Update dev dependencies

| Package              | Current  | Target                             |
| -------------------- | -------- | ---------------------------------- |
| `@types/react`       | ~19.1.0  | ~19.2.0                            |
| `@types/react-dom`   | ~19.1.0  | ~19.2.0                            |
| `react-dom`          | ^19.2.4  | ~19.2.4 (verify latest)            |
| `react-native-maps`  | ^1.20.1  | ^1.20.1 (keep — see known issues)  |

### 2.3 Update engines field

```json
"engines": { "node": ">=20" }   // was >=18
```

### 2.4 Update .nvmrc

```text
22
```

### 2.5 Run tests

- [ ] `npm run lint` passes
- [ ] `npm test` passes (45 tests)
- [ ] `npm run build` passes

## Phase 3 — Upgrade Example App (example/package.json)

### 3.1 Update core dependencies

| Package             | Current    | Target            |
| ------------------- | ---------- | ----------------- |
| `expo`              | ~54.0.29   | ~55.0.0           |
| `react`             | 19.1.0     | 19.2.x            |
| `react-dom`         | ^19.1.0    | ^19.2.0           |
| `react-native`      | 0.81.5     | 0.83.2            |
| `expo-font`         | ~14.0.9    | ~15.0.x           |
| `expo-status-bar`   | ~3.0.8     | ~4.0.x            |
| `react-native-web`  | ^0.21.2    | latest compatible  |

### 3.2 Update dev dependencies

| Package              | Current     | Target   |
| -------------------- | ----------- | -------- |
| `babel-preset-expo`  | ~54.0.7     | ~55.0.x  |
| `jest-expo`          | ~54.0.13    | ~55.0.x  |
| `@types/react`       | ~19.1.0     | ~19.2.0  |
| `@types/react-dom`   | ~19.1.7     | ~19.2.0  |

### 3.3 Update app config

- [ ] Remove `newArchEnabled: false` from `example/app.config.js` (no longer a valid option)

### 3.4 Run upgrade commands

```bash
cd example
npx expo install expo@~55.0.0
npx expo install --fix    # Auto-fix compatible versions
npx expo-doctor           # Check for issues
```

### 3.5 Clean rebuild

```bash
cd example
npx expo prebuild --clean
npx expo run:ios
npx expo run:android
```

## Phase 4 — react-native-maps Compatibility

### Known Issues

- `react-native-maps` versions 1.26+ have compatibility issues with SDK 55 (Google Maps on iOS)
- The `react-native-maps` config plugin may break with SDK 55's version of `@expo/config-plugins`
- The example app config currently has the `react-native-maps` plugin **removed** (done during SDK 54 fix)

### 4.1 Test current version (1.20.1)

- [ ] Verify `react-native-maps@1.20.1` works with New Architecture on SDK 55
- [ ] If it works, keep it
- [ ] If not, try `react-native-maps@1.21.x` (New Architecture-first version)

### 4.2 Alternative: consider expo-maps

- [ ] Evaluate if `expo-maps` is a viable replacement (requires iOS 17+)
- [ ] Only if `react-native-maps` is completely broken on SDK 55

## Phase 5 — Update CI/CD

### 5.1 Update CI workflow

- [ ] Update Node.js version in `.github/workflows/ci.yml` if needed
- [ ] Update Node.js version in `.github/workflows/npm-publish.yml` if needed
- [ ] Verify `npm ci && npm run lint && npm test && npm run build` passes in CI

### 5.2 Update GitHub Actions

- [ ] Check if any action versions need updating for Node 20+ compatibility

## Phase 6 — Documentation Updates

### 6.1 Update README.md

- [ ] Update SDK compatibility table (add SDK 55 row)
- [ ] Update New Architecture support status to "Required"
- [ ] Update minimum version requirements

### 6.2 Update CHANGELOG.md

- [ ] Add entry for SDK 55 upgrade release

### 6.3 Update CONTRIBUTING.md

- [ ] Update dev setup instructions if Node version changes

## Phase 7 — Release

### 7.1 Version bump

- [ ] Bump to `1.3.0` (minor version — new SDK support, updated peer deps)

### 7.2 Release

```bash
npm run release:minor
```

## Risk Assessment

| Risk                                             | Likelihood | Impact | Mitigation                                              |
| ------------------------------------------------ | ---------- | ------ | ------------------------------------------------------- |
| react-native-maps breaks with New Architecture   | Medium     | High   | Test on SDK 54 first; have 1.21.x as fallback           |
| Google Maps config plugin incompatible            | Medium     | Medium | Plugin already removed; manual native config if needed   |
| Web platform regression                          | Low        | Medium | Web shims don't depend on native architecture            |
| Turf.js incompatibility                          | Very Low   | Low    | Pure JS library, no native deps                          |

## Execution Order

| Step | What                                      | Depends On |
| ---- | ----------------------------------------- | ---------- |
| 1    | Enable New Architecture on SDK 54         | —          |
| 2    | Test all platforms with New Architecture   | Step 1     |
| 3    | Upgrade library dev deps and peer deps    | Step 2     |
| 4    | Run library lint + test + build           | Step 3     |
| 5    | Upgrade example app to SDK 55             | Step 4     |
| 6    | Clean rebuild + test iOS/Android/Web      | Step 5     |
| 7    | Fix react-native-maps issues if any       | Step 6     |
| 8    | Update CI/CD and docs                     | Step 7     |
| 9    | Release 1.3.0                             | Step 8     |
