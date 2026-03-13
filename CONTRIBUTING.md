# Contributing

Thank you for your interest in contributing to expo-maps-polygon-editor!

## Development Setup

### Prerequisites

- Node.js >= 20 (see `.nvmrc`)
- npm

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/siposdani87/expo-maps-polygon-editor.git
cd expo-maps-polygon-editor
```

2. Install dependencies:

```bash
npm ci
```

3. Build the library:

```bash
npm run build
```

### Running the Example App

```bash
cd example
npm ci
npx expo start
```

For web, you'll need a Google Maps API key. Copy `.env.example` to `.env` and fill in the key.

## Development Workflow

- `npm run build` — compile TypeScript to `dist/`
- `npm run lint` — run ESLint
- `npm run lint:fix` — auto-fix lint issues
- `npm run format` — format code with Prettier

## Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Ensure `npm run lint` and `npm run build` pass
4. Submit a PR against `develop`
