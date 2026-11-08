import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { scanProject } from '../src/scanner/project.js';
import { scanAndroid } from '../src/scanner/android.js';
import { scanIos } from '../src/scanner/ios.js';
import { parseJavaVersion } from '../src/scanner/environment.js';

describe('Scanner Tests', () => {
  it('correctly parses java version string outputs', () => {
    expect(parseJavaVersion('javac 17.0.10')).toBe('17');
    expect(parseJavaVersion('openjdk version "21.0.2" 2024-01-16')).toBe('21');
    expect(parseJavaVersion('java version "1.8.0_312"')).toBe('8');
    expect(parseJavaVersion('java version "11.0.19"')).toBe('11');
  });

  it('scans React Native project metadata from mock project', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-test-project-'));
    try {
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({
          name: 'AwesomeApp',
          dependencies: {
            'react': '18.3.1',
            'react-native': '0.74.2',
          },
        })
      );

      const info = scanProject(tmpDir);
      expect(info.isReactNative).toBe(true);
      expect(info.isExpo).toBe(false);
      expect(info.reactNativeVersion).toBe('0.74.2');
      expect(info.name).toBe('AwesomeApp');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('scans Android configuration files accurately', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-android-test-'));
    try {
      const androidDir = path.join(tmpDir, 'android');
      const wrapperDir = path.join(androidDir, 'gradle', 'wrapper');
      const appDir = path.join(androidDir, 'app');

      fs.mkdirSync(wrapperDir, { recursive: true });
      fs.mkdirSync(appDir, { recursive: true });

      fs.writeFileSync(
        path.join(wrapperDir, 'gradle-wrapper.properties'),
        'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.8-all.zip\n'
      );

      fs.writeFileSync(
        path.join(androidDir, 'build.gradle'),
        'classpath("com.android.tools.build:gradle:8.4.1")\nkotlinVersion = "1.9.24"\n'
      );

      fs.writeFileSync(
        path.join(appDir, 'build.gradle'),
        'compileSdkVersion = 34\ntargetSdkVersion = 34\nminSdkVersion = 23\nbuildToolsVersion = "34.0.0"\nndkVersion = "26.1.10909125"\n'
      );

      fs.writeFileSync(
        path.join(androidDir, 'gradle.properties'),
        'org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m\n'
      );

      const android = scanAndroid(tmpDir);
      expect(android.hasAndroidDir).toBe(true);
      expect(android.gradleWrapperVersion).toBe('8.8');
      expect(android.agpVersion).toBe('8.4.1');
      expect(android.kotlinVersion).toBe('1.9.24');
      expect(android.compileSdkVersion).toBe('34');
      expect(android.buildToolsVersion).toBe('34.0.0');
      expect(android.ndkVersion).toBe('26.1.10909125');
      expect(android.jvmArgs).toContain('-Xmx4096m');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('scans iOS configuration and Podfile correctly', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-ios-test-'));
    try {
      const iosDir = path.join(tmpDir, 'ios');
      fs.mkdirSync(iosDir, { recursive: true });

      fs.writeFileSync(
        path.join(iosDir, 'Podfile'),
        `platform :ios, '15.1'\nuse_frameworks!\ntarget 'AwesomeApp' do\nend`
      );
      fs.writeFileSync(path.join(iosDir, 'Podfile.lock'), 'PODS:\n');
      fs.writeFileSync(path.join(iosDir, 'Gemfile'), 'source "https://rubygems.org"\n');

      const ios = scanIos(tmpDir);
      expect(ios.hasIosDir).toBe(true);
      expect(ios.deploymentTarget).toBe('15.1');
      expect(ios.usesFrameworks).toBe(true);
      expect(ios.podfileLockExists).toBe(true);
      expect(ios.hasGemfile).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
