# 🚀 Community Launch & Promotion Guide

A practical guide to promote `@mehul214/rn-build-doctor`, gain GitHub stars, attract users, and maximize donations.

---

## 1. 📱 Reddit (r/reactnative)

**Subreddit:** [reddit.com/r/reactnative](https://www.reddit.com/r/reactnative/)  
**Flair:** `Showcase` or `Resource`  
**Title:** *I built an open-source pre-flight build doctor for React Native — catch Gradle and Xcode errors in 5 seconds instead of waiting 10 minutes*

**Body Template:**
```markdown
Hey everyone! 👋

Like many of you, I've lost countless hours waiting 10–15 minutes for Gradle or Xcode builds to run, only for them to crash with cryptic errors like:
- Java 21 vs Gradle 8.0 mismatch
- `compileSdkVersion 34` missing in SDK platforms
- `xcode-select` pointing to CommandLineTools instead of Xcode.app
- OutOfMemory errors from default Gradle JVM heap size
- CocoaPods deployment target mismatches

I built **rn-build-doctor** to solve this. It's an open-source CLI tool that inspects your project configuration and local environment *before* you run the actual build.

### Quick Start (no install required):
```bash
npx @mehul214/rn-build-doctor
```

### Key Features:
- 🤖 **Android Diagnostics:** Java JDK compatibility matrix, Gradle vs AGP, compileSdkVersion, NDK, Kotlin, Gradle JVM heap.
- 🍏 **iOS Diagnostics:** Full Xcode vs Command Line Tools, CocoaPods version, missing Pods, deployment target compatibility.
- 📄 **Shareable Build Health Reports:** `npx @mehul214/rn-build-doctor --report` generates a clean Markdown report you can paste directly into GitHub issues, Slack, or Discord to debug with teammates.
- 🛠️ **Guided Fixes:** `npx @mehul214/rn-build-doctor --fix` gives copy-pasteable commands to fix detected problems.
- 🤖 **CI/CD Ready:** `npx @mehul214/rn-build-doctor --json` exits with code 1 on errors so your pipelines fail fast.

Repo: https://github.com/Mehul214/rn-build-doctor

Would love to hear your feedback, feature requests, or tricky build errors you've encountered that we should add rules for!
```

---

## 2. 🐦 X / Twitter Announcement

**Hashtags:** `#ReactNative #MobileDev #iOSDev #AndroidDev #OpenSource`

**Tweet Draft:**
```text
Tired of waiting 10 minutes for Gradle or Xcode to crash? 😤

Introducing 🩺 rn-build-doctor: a pre-flight build health diagnostic tool for React Native!

✨ Runs in 5 seconds
✨ Detects Java/Gradle/AGP/Xcode/CocoaPods mismatches
✨ Generates shareable build health reports

Try it:
npx @mehul214/rn-build-doctor

🔗 https://github.com/Mehul214/rn-build-doctor
```

---

## 3. 📰 Submit to React Native Newsletters

These weekly newsletters reach over 50,000 React Native developers. Submit your GitHub link:

1. **This Week in React** (Sebastien Lorber): [thisweekinreact.com](https://thisweekinreact.com/)
2. **React Native Newsletter** (Infinite Red): [reactnativenewsletter.com](https://reactnativenewsletter.com/)
3. **Software Mansion Newsletter**: Submit via Twitter or GitHub.

---

## 4. 🌐 React Native Directory

Submit your pull request to [react-native-community/directory](https://github.com/react-native-community/directory):

```json
{
  "githubUrl": "https://github.com/Mehul214/rn-build-doctor",
  "npmPkg": "@mehul214/rn-build-doctor",
  "android": true,
  "ios": true,
  "dev": true
}
```

---

## 5. 💖 Maximizing Donations & Sponsorships

1. **GitHub Sponsors**: Developers and engineering managers with GitHub budgets can sponsor your profile directly at `https://github.com/sponsors/Mehul214`.
2. **Buy Me a Coffee**: High-converting for international developers (`https://buymeacoffee.com/mehulreshac`).
3. **UPI (India)**: Indian developers prefer paying directly through GPay/PhonePe without international transaction fees (`mehulreshamwala7@okhdfcbank`).
4. **Issue Assistance**: When helping developers fix build issues on GitHub or Reddit, provide your diagnosis and gently mention your sponsor links if it saved their day.

