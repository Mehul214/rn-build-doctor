import { describe, it, expect } from 'vitest';
import { javaRule } from '../src/rules/java.js';
import { gradleRule } from '../src/rules/gradle.js';
import { androidSdkRule } from '../src/rules/android-sdk.js';
import { memoryRule } from '../src/rules/memory.js';
import { localPropertiesRule } from '../src/rules/local-properties.js';
import type { DiagnosticContext } from '../src/types.js';

describe('Android Diagnostic Rules', () => {
  const baseContext: DiagnosticContext = {
    project: {
      name: 'TestApp',
      root: '/fake/root',
      isReactNative: true,
      reactNativeVersion: '0.74.0',
      isExpo: false,
      packageManager: 'npm',
      dependencies: { 'react-native': '0.74.0' },
      devDependencies: {},
    },
    android: {
      hasAndroidDir: true,
      gradleWrapperVersion: '8.8',
      agpVersion: '8.4.1',
      compileSdkVersion: '34',
      targetSdkVersion: '34',
      minSdkVersion: '23',
      buildToolsVersion: '34.0.0',
      ndkVersion: '26.1.10909125',
      jvmArgs: '-Xmx4096m -XX:MaxMetaspaceSize=1024m',
    },
    ios: {
      hasIosDir: true,
      deploymentTarget: '15.1',
      hasGemfile: false,
      podsInstalled: true,
      podfileLockExists: true,
    },
    env: {
      os: 'macos',
      osRelease: 'Darwin 24.0.0',
      nodeVersion: 'v20.10.0',
      javaVersion: '17',
      javaHome: '/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home',
      androidHome: '/Users/test/Library/Android/sdk',
      androidSdkInstalled: true,
      installedPlatforms: ['android-34'],
      installedBuildTools: ['34.0.0'],
      installedNdkVersions: ['26.1.10909125'],
      isCommandLineToolsOnly: false,
    },
    verbose: false,
  };

  it('detects missing Java installation', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      env: { ...baseContext.env, javaVersion: undefined },
    };
    const res = await javaRule.check(ctx);
    expect(res.passed).toBe(false);
    expect(res.issues.some((i) => i.id === 'ERR_JAVA_NOT_INSTALLED')).toBe(true);
  });

  it('detects incompatible Java 11 on modern React Native 0.74', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      env: { ...baseContext.env, javaVersion: '11' },
    };
    const res = await javaRule.check(ctx);
    expect(res.passed).toBe(false);
    expect(res.issues.some((i) => i.id === 'ERR_JAVA_TOO_OLD_FOR_RN')).toBe(true);
  });

  it('detects Java 21 incompatibility with older Gradle (< 8.5)', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      android: { ...baseContext.android, gradleWrapperVersion: '8.0' },
      env: { ...baseContext.env, javaVersion: '21' },
    };
    const res = await javaRule.check(ctx);
    expect(res.passed).toBe(false);
    expect(res.issues.some((i) => i.id === 'ERR_JAVA_GRADLE_MISMATCH')).toBe(true);
  });

  it('detects AGP 8.4 requiring at least Gradle 8.6', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      android: {
        ...baseContext.android,
        agpVersion: '8.4.1',
        gradleWrapperVersion: '8.0.0',
      },
    };
    const res = await gradleRule.check(ctx);
    expect(res.passed).toBe(false);
    expect(res.issues.some((i) => i.id === 'ERR_AGP_GRADLE_MISMATCH')).toBe(true);
  });

  it('detects missing ANDROID_HOME environment variable', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      env: { ...baseContext.env, androidHome: undefined, androidSdkInstalled: false },
    };
    const res = await androidSdkRule.check(ctx);
    expect(res.passed).toBe(false);
    expect(res.issues.some((i) => i.id === 'ERR_ANDROID_HOME_MISSING')).toBe(true);
  });

  it('detects missing compileSdkVersion platform package', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      android: { ...baseContext.android, compileSdkVersion: '35' },
      env: { ...baseContext.env, installedPlatforms: ['android-33', 'android-34'] },
    };
    const res = await androidSdkRule.check(ctx);
    expect(res.passed).toBe(false);
    expect(res.issues.some((i) => i.id === 'ERR_COMPILE_SDK_NOT_INSTALLED')).toBe(true);
  });

  it('warns about dangerously low Gradle JVM heap', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      android: { ...baseContext.android, jvmArgs: '-Xmx1024m' },
    };
    const res = await memoryRule.check(ctx);
    expect(res.issues.some((i) => i.id === 'WARN_JVM_HEAP_TOO_LOW')).toBe(true);
  });

  it('detects invalid sdk.dir in android/local.properties', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      android: {
        ...baseContext.android,
        hasLocalProperties: true,
        localPropertiesSdkDir: '/non/existent/android/sdk/path',
      },
    };
    const res = await localPropertiesRule.check(ctx);
    expect(res.passed).toBe(false);
    expect(res.issues.some((i) => i.id === 'ERR_INVALID_LOCAL_PROPERTIES_SDK_DIR')).toBe(true);
  });
});

