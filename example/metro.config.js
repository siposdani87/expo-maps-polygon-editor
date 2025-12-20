const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Block parent node_modules from being resolved to prevent duplicates
config.resolver.blockList = [
  // Block all modules from parent node_modules to prevent duplicates
  new RegExp(`^${workspaceRoot.replace(/[/\\]/g, '[/\\\\]')}/node_modules/react-native-maps/.*`),
  new RegExp(`^${workspaceRoot.replace(/[/\\]/g, '[/\\\\]')}/node_modules/react/.*`),
  new RegExp(`^${workspaceRoot.replace(/[/\\]/g, '[/\\\\]')}/node_modules/react-native/.*`),
];

// Add parent node_modules to node module paths
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force single React instance resolution and add aliases
config.resolver.extraNodeModules = {
  'react': path.resolve(projectRoot, 'node_modules', 'react'),
  'react-dom': path.resolve(projectRoot, 'node_modules', 'react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules', 'react-native'),
  'react-native-maps': path.resolve(projectRoot, 'node_modules', 'react-native-maps'),
  '@siposdani87/expo-maps-polygon-editor': workspaceRoot,
};

// Custom resolver for web platform and monorepo
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // IMPORTANT: Only redirect react-native-maps on web to use web mock
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'react-native-maps-web.tsx'),
    };
  }

  // Resolve @siposdani87/expo-maps-polygon-editor to parent src for monorepo
  if (moduleName === '@siposdani87/expo-maps-polygon-editor') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(workspaceRoot, 'src', 'index.ts'),
    };
  }

  // Force React modules to resolve from example/node_modules for ALL platforms
  // This prevents duplicate React instance errors
  if (moduleName === 'react') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'node_modules', 'react', 'index.js'),
    };
  }

  if (moduleName === 'react/jsx-runtime') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'node_modules', 'react', 'jsx-runtime.js'),
    };
  }

  if (moduleName === 'react/jsx-dev-runtime') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'node_modules', 'react', 'jsx-dev-runtime.js'),
    };
  }

  if (moduleName === 'react-dom') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'node_modules', 'react-dom', 'index.js'),
    };
  }

  if (moduleName === 'react-native') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'node_modules', 'react-native', 'index.js'),
    };
  }

  // Default resolution for all other cases
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
