import { describe, it, expect } from 'vitest';
import { nodeWatchmanRule } from '../src/rules/node-watchman.js';
import type { DiagnosticContext } from '../src/types.js';

describe('Environment & Toolchain Rules', () => {
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
      hasIosDir: false,
      hasGemfile: false,
      podsInstalled: false,
      podfileLockExists: false,
    },
    env: {
      os: 'macos',
      osRelease: 'Darwin 24.0.0',
      nodeVersion: 'v20.10.0',
      androidSdkInstalled: false,
      installedBuildTools: [],
      installedPlatforms: [],
      installedNdkVersions: [],
      isCommandLineToolsOnly: false,
      watchmanVersion: '2024.01.01.00',
    },
    verbose: false,
  };

  it('passes when Node >= 18 and Watchman is installed', async () => {
    const res = await nodeWatchmanRule.check(baseContext);
    expect(res.passed).toBe(true);
    expect(res.issues.length).toBe(0);
  });

  it('detects legacy Node.js version (< 18.0.0)', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      env: { ...baseContext.env, nodeVersion: 'v16.14.0' },
    };
    const res = await nodeWatchmanRule.check(ctx);
    expect(res.passed).toBe(false);
    expect(res.issues.some((i) => i.id === 'ERR_NODE_VERSION_TOO_OLD')).toBe(true);
  });

  it('warns when Watchman is missing on macOS', async () => {
    const ctx: DiagnosticContext = {
      ...baseContext,
      env: { ...baseContext.env, os: 'macos', watchmanVersion: undefined },
    };
    const res = await nodeWatchmanRule.check(ctx);
    expect(res.issues.some((i) => i.id === 'WARN_WATCHMAN_NOT_INSTALLED')).toBe(true);
  });
});

