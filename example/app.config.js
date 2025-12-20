require('dotenv').config();

module.exports = {
  expo: {
    name: "expo-maps-polygon-editor",
    slug: "expo-maps-polygon-editor",
    version: "1.0.0",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.siposdani87.expomapspolygoneditor"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.siposdani87.expomapspolygoneditor"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    },
    plugins: [
      "expo-font",
      [
        "react-native-maps",
        {
          ios: {
            mapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
          },
          android: {
            mapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
          }
        }
      ]
    ]
  }
};
