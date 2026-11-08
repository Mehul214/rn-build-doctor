import { describe, it, expect } from 'vitest';
import { xcodeRule } from '../src/rules/xcode.js';
import { cocoapodsRule } from '../src/rules/cocoapods.js';
import { iosTargetRule } from '../src/rules/ios-target.js';
import type { DiagnosticContext } from '../src/types.js';

describe('iOS Diagnostic Rules', () => {
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
    android: { hasAndroidDir: false },
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
      androidSdkInstalled: false,
      installedBuildTools: [],
      installedPlatforms: [],
      installedNdkVersions: [],
      xcodeVersion: '15.3',
      xcodePath: '/Applications/Xcode.app/Contents/Developer',
      isCommandLineToolsOnly: false,
      cocoapodsVersion: '1.15.2',
      rubyVersion: '3.2.0',
    },
    verbose: false,
  };

  it('detects xcode-select pointing to CommandLineTools', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      env: {
        ...baseContext.env,
        xcodePath: '/Library/Developer/CommandLineTools',
        isCommandLineToolsOnly: true,
      },
    };
    const res = await xcodeRule.check(ctx);
    expect(res.issues.some((i) => i.id === 'ERR_XCODE_SELECT_COMMAND_LINE_TOOLS')).toBe(true);
  });

  it('detects missing CocoaPods', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      env: { ...baseContext.env, cocoapodsVersion: undefined },
    };
    const res = await cocoapodsRule.check(ctx);
    expect(res.passed).toBe(false);
    expect(res.issues.some((i) => i.id === 'ERR_COCOAPODS_NOT_INSTALLED')).toBe(true);
  });

  it('warns when Pods are not installed', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      ios: { ...baseContext.ios, podsInstalled: false, podfileLockExists: false },
    };
    const res = await cocoapodsRule.check(ctx);
    expect(res.issues.some((i) => i.id === 'WARN_PODS_NOT_INSTALLED')).toBe(true);
  });

  it('detects deployment target lower than required by React Native 0.74', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      ios: { ...baseContext.ios, deploymentTarget: '13.4' }, // 0.74 requires 15.1
    };
    const res = await iosTargetRule.check(ctx);
    expect(res.passed).toBe(false);
    expect(res.issues.some((i) => i.id === 'ERR_IOS_DEPLOYMENT_TARGET_TOO_LOW')).toBe(true);
  });
});

