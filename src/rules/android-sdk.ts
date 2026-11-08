import type { DiagnosticIssue, DiagnosticContext, Rule, RuleCheckResult } from '../types.js';

export const androidSdkRule: Rule = {
  id: 'android-sdk-setup',
  name: 'Android SDK & Build Tools Configuration',
  category: 'android',
  check: async (context: DiagnosticContext): Promise<RuleCheckResult> => {
    const issues: DiagnosticIssue[] = [];
    const { env, android } = context;

    if (!android.hasAndroidDir) {
      return {
        ruleId: 'android-sdk-setup',
        ruleName: 'Android SDK & Build Tools Configuration',
        category: 'android',
        passed: true,
        issues: [],
      };
    }

    // 1. Check ANDROID_HOME
    if (!env.androidHome || !env.androidSdkInstalled) {
      issues.push({
        id: 'ERR_ANDROID_HOME_MISSING',
        title: 'ANDROID_HOME Environment Variable Missing or Invalid',
        severity: 'error',
        category: 'environment',
        message:
          'ANDROID_HOME (or ANDROID_SDK_ROOT) environment variable is not defined or the specified directory does not exist.',
        suggestion:
          env.os === 'macos'
            ? 'Add export ANDROID_HOME=$HOME/Library/Android/sdk to your ~/.zshrc or ~/.bash_profile'
            : env.os === 'windows'
            ? 'Set ANDROID_HOME to %LOCALAPPDATA%\\Android\\Sdk in Windows Environment Variables'
            : 'Add export ANDROID_HOME=$HOME/Android/Sdk to your ~/.bashrc',
        fixCommand:
          env.os === 'macos'
            ? 'echo "export ANDROID_HOME=\\$HOME/Library/Android/sdk" >> ~/.zshrc'
            : undefined,
        docsUrl: 'https://reactnative.dev/docs/environment-setup',
      });
      return {
        ruleId: 'android-sdk-setup',
        ruleName: 'Android SDK & Build Tools Configuration',
        category: 'android',
        passed: false,
        issues,
      };
    }

    // 2. Check compileSdkVersion
    if (android.compileSdkVersion) {
      const targetPlatform = `android-${android.compileSdkVersion}`;
      const hasPlatform = env.installedPlatforms.includes(targetPlatform);

      if (!hasPlatform && env.installedPlatforms.length > 0) {
        issues.push({
          id: 'ERR_COMPILE_SDK_NOT_INSTALLED',
          title: `Required Android SDK Platform ${targetPlatform} Missing`,
          severity: 'error',
          category: 'android',
          message: `Your project configures compileSdkVersion ${android.compileSdkVersion}, but "${targetPlatform}" is not installed in ${env.androidHome}/platforms.`,
          suggestion: `Open Android Studio SDK Manager or use sdkmanager to install platform "${targetPlatform}".`,
          fixCommand: `$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platforms;${targetPlatform}"`,
          docsUrl: 'https://developer.android.com/tools/sdkmanager',
        });
      }
    }

    // 3. Check buildToolsVersion
    if (android.buildToolsVersion) {
      const hasBuildTools = env.installedBuildTools.includes(android.buildToolsVersion);
      if (!hasBuildTools && env.installedBuildTools.length > 0) {
        issues.push({
          id: 'WARN_BUILD_TOOLS_NOT_INSTALLED',
          title: `Android Build Tools ${android.buildToolsVersion} Missing`,
          severity: 'warning',
          category: 'android',
          message: `Your project specifies buildToolsVersion "${android.buildToolsVersion}", which is not found in ${env.androidHome}/build-tools.`,
          suggestion: `Install build-tools version ${android.buildToolsVersion} via Android Studio or sdkmanager.`,
          fixCommand: `$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;${android.buildToolsVersion}"`,
          docsUrl: 'https://developer.android.com/tools/sdkmanager',
        });
      }
    }

    // 4. Check NDK if specified
    if (android.ndkVersion) {
      const hasNdk = env.installedNdkVersions.includes(android.ndkVersion);
      if (!hasNdk) {
        issues.push({
          id: 'WARN_NDK_MISSING',
          title: `Android NDK Version ${android.ndkVersion} Missing`,
          severity: 'warning',
          category: 'android',
          message: `Your project specifies ndkVersion "${android.ndkVersion}", but it is not installed in ${env.androidHome}/ndk.`,
          suggestion: `Install NDK version ${android.ndkVersion} via Android Studio SDK Manager -> SDK Tools -> NDK (Side by side).`,
          fixCommand: `$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "ndk;${android.ndkVersion}"`,
          docsUrl: 'https://reactnative.dev/docs/environment-setup',
        });
      }
    }

    return {
      ruleId: 'android-sdk-setup',
      ruleName: 'Android SDK & Build Tools Configuration',
      category: 'android',
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  },
};

