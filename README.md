# Smart Campus

A cross-platform mobile app (Android, iOS, and web) built with **Expo** and **React Native**, using **Expo Router** for file-based navigation.

## Framework & Key Libraries

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) ~56.0 |
| UI | React Native 0.85 + React 19 |
| Routing | Expo Router (file-based, `src/app/`) |
| Camera | expo-camera |
| Notifications | expo-notifications |
| Storage | @react-native-async-storage/async-storage |
| Language | TypeScript ~6.0 |

## System Dependencies

### All platforms

- **Node.js** 18 or later — [nodejs.org](https://nodejs.org)
- **npm** 9+ (bundled with Node)

### Android

- **Android Studio** with the Android SDK installed
- An Android emulator (AVD) **or** a physical Android device with USB debugging enabled

### iOS (macOS only)

- **Xcode** 15 or later (from the Mac App Store)
- **iOS Simulator** (included with Xcode) or a physical iPhone/iPad

### Physical device (any platform)

- **Expo Go** app installed on the device — available on the [App Store](https://apps.apple.com/app/expo-go/id982107779) and [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npx expo start
```

The terminal will display a QR code and a menu of options.

### Run on a physical device

Scan the QR code with:
- **Android** — the Expo Go app
- **iOS** — the built-in Camera app (which opens Expo Go)

### Run on an emulator / simulator

Press the key shown in the terminal:

| Key | Target |
|---|---|
| `a` | Android emulator |
| `i` | iOS simulator (macOS only) |
| `w` | Web browser |

Or use the npm scripts directly:

```bash
npm run android   # Android emulator
npm run ios       # iOS simulator
npm run web       # Web browser
```

## Project Structure

```
smart-campus/
├── src/
│   ├── app/          # Screens (file-based routing via Expo Router)
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── explore.tsx
│   │   ├── tasks.tsx
│   │   └── profile.tsx
│   ├── components/   # Shared UI components
│   ├── constants/    # Theme and global constants
│   └── hooks/        # Custom React hooks
├── assets/           # Images, fonts, icons
├── package.json
└── tsconfig.json
```

## Building for Production

Production builds use **EAS Build** (Expo Application Services).

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build for Android (APK / AAB)
eas build --platform android

# Build for iOS (IPA)
eas build --platform ios
```

See the [EAS Build documentation](https://docs.expo.dev/build/introduction/) for signing and submission details.
