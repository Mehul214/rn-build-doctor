import fs from 'node:fs';
import path from 'node:path';
import type { ProjectInfo } from '../types.js';

export function scanProject(projectRoot: string): ProjectInfo {
  const pkgPath = path.join(projectRoot, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return {
      name: path.basename(projectRoot),
      root: projectRoot,
      isReactNative: false,
      isExpo: false,
      packageManager: detectPackageManager(projectRoot),
      dependencies: {},
      devDependencies: {},
    };
  }

  let pkg: any = {};
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    pkg = {};
  }

  const dependencies = pkg.dependencies || {};
  const devDependencies = pkg.devDependencies || {};

  const rnDep = dependencies['react-native'] || devDependencies['react-native'];
  const expoDep = dependencies['expo'] || devDependencies['expo'];

  const isReactNative = Boolean(rnDep || expoDep);
  const isExpo = Boolean(expoDep);

  // Clean version strings (e.g. ^0.74.0 -> 0.74.0)
  const cleanVersion = (v?: string) => v ? v.replace(/^[\^~>=<]+/, '').trim() : undefined;

  let newArchEnabled: boolean | undefined = undefined;

  // Check gradle.properties for newArchEnabled
  const gradlePropsPath = path.join(projectRoot, 'android', 'gradle.properties');
  if (fs.existsSync(gradlePropsPath)) {
    const props = fs.readFileSync(gradlePropsPath, 'utf-8');
    const match = props.match(/newArchEnabled\s*=\s*(true|false)/i);
    if (match) {
      newArchEnabled = match[1].toLowerCase() === 'true';
    }
  }

  // Check Podfile.properties.json if available
  const podPropsPath = path.join(projectRoot, 'ios', 'Podfile.properties.json');
  if (newArchEnabled === undefined && fs.existsSync(podPropsPath)) {
    try {
      const podProps = JSON.parse(fs.readFileSync(podPropsPath, 'utf-8'));
      if (typeof podProps['newArchEnabled'] === 'boolean') {
        newArchEnabled = podProps['newArchEnabled'];
      }
    } catch {
      // ignore
    }
  }

  return {
    name: pkg.name || path.basename(projectRoot),
    root: projectRoot,
    isReactNative,
    reactNativeVersion: cleanVersion(rnDep),
    isExpo,
    expoVersion: cleanVersion(expoDep),
    newArchEnabled,
    packageManager: detectPackageManager(projectRoot),
    dependencies,
    devDependencies,
  };
}

function detectPackageManager(projectRoot: string): 'npm' | 'yarn' | 'pnpm' | 'bun' {
  if (fs.existsSync(path.join(projectRoot, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(projectRoot, 'pnpm-lock.yaml'))) return 'pnpm';
  if (
    fs.existsSync(path.join(projectRoot, 'bun.lockb')) ||
    fs.existsSync(path.join(projectRoot, 'bun.lock'))
  ) {
    return 'bun';
  }
  return 'npm';
}

