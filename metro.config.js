const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add support for .cjs files
defaultConfig.resolver.assetExts.push('cjs');

// Disable experimental package exports support for better compatibility
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
