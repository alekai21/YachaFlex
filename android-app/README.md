# Yacha Flex Android Forwarder

Native Android app that:
1. Accepts an ingest endpoint from QR or deep link.
2. Reads heart-rate samples from Health Connect (last 1 hour).
3. Sends the payload as JSON with `POST` using OkHttp.

The previous README was for a different implementation (Retrofit + JWT + HRV). This file documents the current code in this folder.

## Quick start (install + run)

Install these first:

1. Android Studio (latest stable).
2. Android SDK Platform `36` (SDK Manager).
3. Android SDK Build-Tools and Platform-Tools (SDK Manager).
4. JDK `17+` (or keep the JDK path configured in `gradle.properties`).
5. On device/emulator: Health Connect app/provider (`com.google.android.apps.healthdata`) and camera support.

Run the app:

1. Connect a device or start an emulator.
2. From `android-app` run:

```powershell
.\gradlew.bat :app:installDebug
```

3. Launch `Yacha Flex Forwarder` on the device.

## Current behavior

- Scan flow:
  - Tap `Scan QR`.
  - CameraX + ML Kit reads a QR code.
  - QR content is parsed as endpoint or deep link.
- Deep-link flow:
  - `yachaflex://connect?...`
  - `https://yachaflex.link/connect?...`
  - Opening one of these links launches `MainActivity`.
- Health flow:
  - Requests `READ_HEART_RATE` permission from Health Connect.
  - Reads `HeartRateRecord` samples for the last hour.
  - Builds summary data in UI (count, min, max, average, last samples).
- Send flow:
  - Posts JSON to selected endpoint.
  - On HTTP 2xx: clears session and shows `Sent successfully.`
  - On non-2xx/network error: keeps state and shows `Send failed.`

## Supported incoming formats

Any plain text URL works. Deep links are also supported.

### Custom scheme

```text
yachaflex://connect?endpoint=https%3A%2F%2Fexample.com%2Fingest
```

### HTTPS app link

```text
https://yachaflex.link/connect?endpoint=https%3A%2F%2Fexample.com%2Fingest
```

If `endpoint` query param is missing, the raw incoming string is used as the target URL.

## JSON payload sent by the app

```json
{
  "window_start": "2026-02-27T15:20:10.123Z",
  "window_end": "2026-02-27T16:20:10.123Z",
  "heart_rate": [
    { "time": "2026-02-27T16:19:30.000Z", "bpm": 74.0 },
    { "time": "2026-02-27T16:18:45.000Z", "bpm": 72.0 }
  ]
}
```

No auth header is added in this implementation.

## Tech stack and versions

- Android Gradle Plugin: `9.1.0-rc01` (in `settings.gradle`)
- Gradle wrapper: `9.3.1`
- Kotlin Android plugin declared: `2.2.10`
- `compileSdk`: `36`
- `targetSdk`: `34`
- `minSdk`: `26`
- Java compatibility: `17`
- Main libraries:
  - `androidx.health.connect:connect-client:1.2.0-alpha02`
  - CameraX `1.3.4` (`camera-core`, `camera-camera2`, `camera-lifecycle`, `camera-view`)
  - `com.google.mlkit:barcode-scanning:17.2.0`
  - `com.squareup.okhttp3:okhttp:4.12.0`

## Permissions and manifest hooks

- Runtime permissions:
  - `android.permission.CAMERA`
  - `android.permission.health.READ_HEART_RATE`
- Normal permission:
  - `android.permission.INTERNET`
- Health Connect integration:
  - `PermissionsRationaleActivity` handles rationale intent.
  - `OnboardingActivity` handles onboarding intent.
  - Aliases are registered for permission usage and Android U+ onboarding action.

## Build and run

### Requirements

- Android Studio with modern SDK/AGP support.
- Android SDK for `compileSdk 36`.
- JDK available for Gradle.

`gradle.properties` currently contains:

```properties
org.gradle.java.home=C:\\Java\\jdk-25.0.2
```

If your machine does not have that exact path, update or remove this line.

### Build debug APK

Windows:

```powershell
.\gradlew.bat :app:assembleDebug
```

macOS/Linux:

```bash
./gradlew :app:assembleDebug
```

Output APK:

```text
app/build/outputs/apk/debug/app-debug.apk
```

## Quick test

1. Install Health Connect provider (`com.google.android.apps.healthdata`) if required on your device.
2. Launch app, scan a QR containing an endpoint or open a deep link.
3. Grant Health Connect heart-rate permission when prompted.
4. Tap `Send`.

You can trigger a deep link by ADB:

```bash
adb shell am start -a android.intent.action.VIEW -d "yachaflex://connect?endpoint=https%3A%2F%2Fwebhook.site%2Fyour-id"
```

## Project structure

```text
android-app/
  app/src/main/java/com/example/yachaflex/
    MainActivity.kt
    QrScannerActivity.kt
    OnboardingActivity.kt
    PermissionsRationaleActivity.kt
    SessionViewModel.kt
  app/src/main/res/
    layout/activity_main.xml
    layout/activity_qr_scanner.xml
    drawable/*
    values/{colors,styles,themes}.xml
  app/src/main/AndroidManifest.xml
  app/build.gradle
  settings.gradle
```

## Important integration note

This Android app currently sends `window_start`, `window_end`, and `heart_rate[]` samples.

In this same repository, `backend/routers/biometrics.py` expects:

```json
{
  "heart_rate": 72.5,
  "hrv": 35.0,
  "activity": 1200
}
```

So this Android module is not directly compatible with that backend endpoint without an adapter or payload transformation.
