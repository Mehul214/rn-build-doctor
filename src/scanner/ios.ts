import fs from 'node:fs';
import path from 'node:path';
import type { IosInfo } from '../types.js';

export function scanIos(projectRoot: string): IosInfo {
  const iosDir = path.join(projectRoot, 'ios');
  if (!fs.existsSync(iosDir)) {
    return {
      hasIosDir: false,
      hasGemfile: false,
      podsInstalled: false,
      podfileLockExists: false,
    };
  }

  const result: IosInfo = {
    hasIosDir: true,
    hasGemfile: false,
    podsInstalled: false,
    podfileLockExists: false,
  };

  // 1. Check Podfile
  const podfilePath = path.join(iosDir, 'Podfile');
  if (fs.existsSync(podfilePath)) {
    const podfileContent = fs.readFileSync(podfilePath, 'utf-8');

    // Match platform :ios, '13.4' or similar
    const platformMatch =
      podfileContent.match(/platform\s+:ios\s*,\s*['"]([0-9.]+)['"]/) ||
      podfileContent.match(/min_ios_version_supported\s*=\s*['"]([0-9.]+)['"]/);
    if (platformMatch) {
      result.deploymentTarget = platformMatch[1];
    }

    result.usesFrameworks = /use_frameworks!/.test(podfileContent);
  }

  // 2. Check Podfile.lock and Pods
  const podfileLockPath = path.join(iosDir, 'Podfile.lock');
  result.podfileLockExists = fs.existsSync(podfileLockPath);

  const podsDir = path.join(iosDir, 'Pods');
  result.podsInstalled =
    fs.existsSync(podsDir) &&
    fs.existsSync(path.join(podsDir, 'Manifest.lock'));

  // 3. Check Gemfile (in ios/ or root)
  result.hasGemfile =
    fs.existsSync(path.join(iosDir, 'Gemfile')) ||
    fs.existsSync(path.join(projectRoot, 'Gemfile'));

  // 4. Find xcodeproj name
  try {
    const files = fs.readdirSync(iosDir);
    const xcodeProj = files.find((f) => f.endsWith('.xcodeproj'));
    if (xcodeProj) {
      result.xcodeProjName = xcodeProj.replace('.xcodeproj', '');
    }
  } catch {
    // ignore
  }

  return result;
}

