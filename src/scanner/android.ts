import fs from 'node:fs';
import path from 'node:path';
import type { AndroidInfo } from '../types.js';

export function scanAndroid(projectRoot: string): AndroidInfo {
  const androidDir = path.join(projectRoot, 'android');
  if (!fs.existsSync(androidDir)) {
    return { hasAndroidDir: false };
  }

  const result: AndroidInfo = {
    hasAndroidDir: true,
  };

  // 1. Check gradle-wrapper.properties
  const wrapperPropsPath = path.join(
    androidDir,
    'gradle',
    'wrapper',
    'gradle-wrapper.properties'
  );
  if (fs.existsSync(wrapperPropsPath)) {
    const content = fs.readFileSync(wrapperPropsPath, 'utf-8');
    const match = content.match(/gradle-([0-9.]+)-(all|bin)\.zip/);
    if (match) {
      result.gradleWrapperVersion = match[1];
    }
  }

  // 2. Check root build.gradle or settings.gradle
  const buildGradlePath = path.join(androidDir, 'build.gradle');
  const settingsGradlePath = path.join(androidDir, 'settings.gradle');
  const rootGradleContent = [
    fs.existsSync(buildGradlePath) ? fs.readFileSync(buildGradlePath, 'utf-8') : '',
    fs.existsSync(settingsGradlePath) ? fs.readFileSync(settingsGradlePath, 'utf-8') : '',
  ].join('\n');

  if (rootGradleContent) {
    // Match AGP
    const agpMatch =
      rootGradleContent.match(/com\.android\.tools\.build:gradle:([0-9.]+)/) ||
      rootGradleContent.match(/id\s*\(?['"]com\.android\.application['"]\)?\s*version\s*['"]([0-9.]+)['"]/);
    if (agpMatch) {
      result.agpVersion = agpMatch[1];
    }

    // Match Kotlin
    const kotlinMatch =
      rootGradleContent.match(/kotlin(?:Version|_version)\s*=\s*['"]([0-9.]+)['"]/) ||
      rootGradleContent.match(/id\s*\(?['"]org\.jetbrains\.kotlin\.android['"]\)?\s*version\s*['"]([0-9.]+)['"]/);
    if (kotlinMatch) {
      result.kotlinVersion = kotlinMatch[1];
    }
  }

  // 3. Check app/build.gradle
  const appBuildGradlePath = path.join(androidDir, 'app', 'build.gradle');
  if (fs.existsSync(appBuildGradlePath)) {
    const content = fs.readFileSync(appBuildGradlePath, 'utf-8');

    const compileSdkMatch =
      content.match(/compileSdkVersion\s*=?\s*([0-9]+)/) ||
      content.match(/compileSdk\s*=?\s*([0-9]+)/);
    if (compileSdkMatch) {
      result.compileSdkVersion = compileSdkMatch[1];
    }

    const targetSdkMatch =
      content.match(/targetSdkVersion\s*=?\s*([0-9]+)/) ||
      content.match(/targetSdk\s*=?\s*([0-9]+)/);
    if (targetSdkMatch) {
      result.targetSdkVersion = targetSdkMatch[1];
    }

    const minSdkMatch =
      content.match(/minSdkVersion\s*=?\s*([0-9]+)/) ||
      content.match(/minSdk\s*=?\s*([0-9]+)/);
    if (minSdkMatch) {
      result.minSdkVersion = minSdkMatch[1];
    }

    const buildToolsMatch = content.match(/buildToolsVersion\s*=?\s*['"]([0-9.]+)['"]/);
    if (buildToolsMatch) {
      result.buildToolsVersion = buildToolsMatch[1];
    }

    const ndkMatch = content.match(/ndkVersion\s*=?\s*['"]([0-9.]+)['"]/);
    if (ndkMatch) {
      result.ndkVersion = ndkMatch[1];
    }
  }

  // 4. Check gradle.properties
  const gradlePropsPath = path.join(androidDir, 'gradle.properties');
  if (fs.existsSync(gradlePropsPath)) {
    const content = fs.readFileSync(gradlePropsPath, 'utf-8');
    const jvmMatch = content.match(/org\.gradle\.jvmargs\s*=\s*([^\r\n]+)/);
    if (jvmMatch) {
      result.jvmArgs = jvmMatch[1].trim();
    }
    if (!result.kotlinVersion) {
      const kotlinPropMatch = content.match(/kotlinVersion\s*=\s*([0-9.]+)/);
      if (kotlinPropMatch) {
        result.kotlinVersion = kotlinPropMatch[1];
      }
    }
  }

  return result;
}
