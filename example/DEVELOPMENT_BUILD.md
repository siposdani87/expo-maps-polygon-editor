# Development Build Setup Guide

This guide will help you set up and run the expo-maps-polygon-editor example app using a development build.

## Why Development Build?

A development build is required for this project because:
- **react-native-maps** is a native module that requires custom native code
- Expo Go has limited support for Google Maps on Android (deprecated in newer SDKs)
- Development builds provide full control over map features and better stability

## Prerequisites

Before you begin, ensure you have:

### For iOS Development:
- macOS with Xcode installed (latest version)
- CocoaPods installed (`sudo gem install cocoapods`)
- iOS Simulator or a physical iOS device

### For Android Development:
- Android Studio installed
- Android SDK configured
- Android Emulator or a physical Android device
- **Google Maps API Key** (see below)

## Getting a Google Maps API Key

### For Android:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps SDK for Android** API
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key
6. Update `example/app.json`:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_ACTUAL_API_KEY_HERE"
       }
     }
   }
   ```

### For iOS:

iOS uses Apple Maps by default, so no API key is required. If you want to use Google Maps on iOS, additional configuration is needed.

## Setup Steps

### 1. Install Dependencies

```bash
cd example
npm install
```

### 2. Prebuild the Native Projects

This generates the `android/` and `ios/` folders with all native configurations:

```bash
npm run prebuild
```

Or to clean previous builds:

```bash
npm run prebuild:clean
```

### 3. Run the Development Build

#### For iOS:

```bash
npm run run:ios
```

This will:
- Build the iOS app
- Install it on the simulator
- Start the Metro bundler

#### For Android:

```bash
npm run run:android
```

This will:
- Build the Android app
- Install it on the emulator/device
- Start the Metro bundler

## Available Scripts

- `npm start` - Start Metro bundler (use after building)
- `npm run prebuild` - Generate native folders
- `npm run prebuild:clean` - Clean and regenerate native folders
- `npm run run:ios` - Build and run on iOS
- `npm run run:android` - Build and run on Android
- `npm run ios` - Start Expo Go for iOS (limited functionality)
- `npm run android` - Start Expo Go for Android (limited functionality)

## Troubleshooting

### iOS Build Issues:

1. **Pod install fails:**
   ```bash
   cd ios
   pod install --repo-update
   cd ..
   ```

2. **Xcode build errors:**
   - Open `ios/expomapspolygoneditor.xcworkspace` in Xcode
   - Clean Build Folder (Cmd + Shift + K)
   - Rebuild

### Android Build Issues:

1. **Google Maps not showing:**
   - Verify your API key is correct in `app.json`
   - Ensure Maps SDK for Android is enabled in Google Cloud Console
   - Rebuild the app after changing the API key

2. **Gradle build fails:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run run:android
   ```

3. **Metro bundler cache issues:**
   ```bash
   npx expo start -c
   ```

## Development Workflow

### Making Changes:

1. Make code changes in the source files
2. The Metro bundler will automatically reload
3. For native changes (plugins, dependencies), rebuild:
   ```bash
   npm run prebuild:clean
   npm run run:ios  # or run:android
   ```

### Testing on Physical Devices:

#### iOS:
1. Connect your iPhone via USB
2. Trust the computer on your device
3. Run: `npm run run:ios -- --device`

#### Android:
1. Enable Developer Options and USB Debugging on your device
2. Connect via USB
3. Run: `npm run run:android`

## Using Expo Go (Limited)

You can still use Expo Go for quick testing, but with limitations:

```bash
npm start
```

Then scan the QR code with:
- iOS: Camera app
- Android: Expo Go app

**Note:** Google Maps support in Expo Go for Android is deprecated.

## EAS Build (Production)

For production builds, use EAS Build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Additional Resources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [react-native-maps Documentation](https://docs.expo.dev/versions/latest/sdk/map-view/)
- [Google Maps API Setup](https://developers.google.com/maps/documentation/android-sdk/get-api-key)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
