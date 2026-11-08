# 🩺 rn-build-doctor

> Pre-flight build health diagnostic tool for React Native. Catch Android and iOS build failures before you run the actual build.

[![npm version](https://img.shields.io/npm/v/@mehul214/rn-build-doctor.svg?color=blue)](https://www.npmjs.com/package/@mehul214/rn-build-doctor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Buy Me A Coffee](https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg)](https://buymeacoffee.com/mehulreshac)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-pink.svg)](https://github.com/sponsors/Mehul214)

Instead of waiting 10 minutes for Gradle or Xcode to fail, run one command:

```bash
npx @mehul214/rn-build-doctor
```

It scans your project configuration and local development environment, identifies potential issues, explains why they matter, and gives you actionable copy-pasteable commands to fix them.

---

## 📸 Illustrative Terminal Output

```text
 🩺  RN Build Doctor v1.0.0
 Pre-flight diagnostic for React Native Android & iOS builds

Project: SuperShopApp [React Native 0.74.2] New Arch (Enabled)
Host OS: Darwin 25.6.0 | Node v26.12.1

────────────────────────────────────────────────────────────────
✔ 8 checks passed   ⚠ 1 warning found   ✖ 2 errors found
────────────────────────────────────────────────────────────────

 ERRORS 

[ERROR 01] Android Gradle Plugin (AGP) & Gradle Mismatch
  Problem:     Android Gradle Plugin 8.4.1 requires Gradle 8.6.0 or higher, but your project is using Gradle 8.0.
  Action:      Update your Gradle wrapper distributionUrl to Gradle 8.6.0 or higher.
  Suggested:   cd android && ./gradlew wrapper --gradle-version 8.6.0
  Reference:   https://developer.android.com/build/releases/gradle-plugin#updating-gradle

[ERROR 02] Active Developer Directory Is Set to Command Line Tools
  Problem:     Your active developer directory is set to "/Library/Developer/CommandLineTools".
  Action:      Point xcode-select to the full Xcode application developer folder.
  Suggested:   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  Reference:   https://reactnative.dev/docs/environment-setup

 WARNINGS 

[WARN 01] Low Gradle JVM Heap Allocation
  Problem:     Gradle is allocated only 1024MB heap space (-Xmx1024m).
  Action:      Increase -Xmx to at least -Xmx2048m in android/gradle.properties.

🚨 Build is likely to fail! Please resolve the errors above before running gradle or xcodebuild.
```

---

## ⚡ Quick Start

No installation required! Just run via `npx` inside your React Native project root:

```bash
npx rn-build-doctor
```

Or install globally:

```bash
npm install -g rn-build-doctor
rn-build-doctor
```

---

## 🛠️ CLI Commands & Options

| Command / Flag | Description |
| :--- | :--- |
| `npx rn-build-doctor` | Runs all diagnostic checks (Android & iOS) |
| `npx rn-build-doctor android` | Runs Android-specific build diagnostics |
| `npx rn-build-doctor ios` | Runs iOS-specific build diagnostics |
| `-v, --verbose` | Show detailed environment details and informational notes |
| `--json` | Output machine-readable JSON for CI/CD pipelines |
| `-r, --report [file]` | Generate a shareable Markdown build health report (default: `rn-build-doctor-report.md`) |
| `--fix` | Show guided copy-pasteable fix commands for detected issues |
| `--cwd <path>` | Run diagnostics against another directory |

---

## 🔍 What Problems Does It Detect?

### 🤖 Android Diagnostics

| Check | Problem Detected | Impact |
| :--- | :--- | :--- |
| **Java / JDK** | Missing Java, Java 11 with RN 0.73+, Java 21 with Gradle < 8.5 | Gradle fails with compilation or daemon errors |
| **JAVA_HOME** | Missing or pointing to an invalid JDK runtime | Builds fail or pick up wrong system version |
| **Gradle & AGP** | AGP / Gradle wrapper version mismatch (e.g. AGP 8.4 + Gradle 8.0) | Gradle build fails immediately |
| **Android SDK** | `ANDROID_HOME` missing or invalid path | Gradle cannot locate SDK tools |
| **compileSdkVersion** | Target platform missing in `$ANDROID_HOME/platforms` | Build fails with "Platform android-XX not found" |
| **Build Tools** | Missing specified build-tools version in SDK | Packaging fails |
| **NDK** | Missing required NDK version for C++ / New Architecture | C++ build fails during CMake compilation |
| **Kotlin** | Outdated or incompatible Kotlin compiler plugin | Kotlin compiler compilation errors |
| **JVM Heap Memory** | Missing or low `-Xmx` heap limit (< 2048MB) | Gradle daemon terminates with OutOfMemoryError |

### 🍏 iOS Diagnostics

| Check | Problem Detected | Impact |
| :--- | :--- | :--- |
| **Xcode CLI Tools** | `xcode-select` pointing to `CommandLineTools` instead of Xcode.app | Simulator launch fails, `iphonesimulator` SDK missing |
| **Xcode Version** | Xcode version too old for target React Native version | App Store rejection or compiler incompatibility |
| **CocoaPods** | CocoaPods not installed or outdated (< 1.14.0) | Pod dependency resolution fails |
| **Pods State** | Missing `ios/Pods` or `Podfile.lock` | Xcode build fails with missing native headers |
| **Deployment Target**| `platform :ios` lower than RN minimum (e.g. iOS 12 on RN 0.74+) | Pod resolution fails |
| **Frameworks** | `use_frameworks!` dynamic linkage caveats | Linker errors with native libraries |

---

## 🌟 Shareable Build Health Report

Debugging a build issue with a teammate, maintainer, or in a GitHub issue? Run:

```bash
npx rn-build-doctor --report
```

This generates `rn-build-doctor-report.md`, a formatted Markdown report containing:
- Executive summary badge table
- Host environment & system specs
- Android & iOS project configurations
- Detailed error explanations and suggested commands

Attach it directly to GitHub issues, Discord, or Slack!

---

## 🤖 CI / CD Pipelines

You can integrate `rn-build-doctor` in GitHub Actions, GitLab CI, or Bitrise:

```bash
npx rn-build-doctor --json
```

`rn-build-doctor` exits with code `0` if all checks pass and code `1` if any critical errors are detected.

---

## 💖 Support the Project & Sponsoring

Building and maintaining open-source developer tooling takes dedicated effort. If `rn-build-doctor` saves you or your team hours of debugging Gradle and Xcode failures, please consider supporting development:

- ⭐️ **Star the repository on GitHub** (helps more React Native developers discover it)
- 💖 **[Sponsor on GitHub Sponsors](https://github.com/sponsors/Mehul214)**
- ☕️ **[Buy Me a Coffee](https://buymeacoffee.com/mehulreshac)**

<p align="left">
  <a href="https://buymeacoffee.com/mehulreshac" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="42" />
  </a>
</p>

### ☕️ Support via UPI

If you're in India or use any UPI-enabled payment app (Google Pay, PhonePe, Paytm, BHIM, Cred, Amazon Pay):

- **UPI ID:** `mehulreshamwala7@okhdfcbank`
- **Payee Name:** Mehul Reshamwala

<p align="left">
  <a href="upi://pay?pa=mehulreshamwala7@okhdfcbank&pn=Mehul%20Reshamwala&cu=INR&tn=Support%20rn-build-doctor">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi%3A%2F%2Fpay%3Fpa%3Dmehulreshamwala7%40okhdfcbank%26pn%3DMehul%2520Reshamwala%26cu%3DINR%26tn%3DSupport%2520rn-build-doctor" alt="Scan to Pay with UPI" width="180" height="180" />
  </a>
  <br />
  <sub>Scan with Google Pay / PhonePe / Paytm or <a href="upi://pay?pa=mehulreshamwala7@okhdfcbank&pn=Mehul%20Reshamwala&cu=INR&tn=Support%20rn-build-doctor">tap here on mobile to pay directly</a>.</sub>
</p>

---

## 📜 License

MIT © [Mehul](LICENSE)

