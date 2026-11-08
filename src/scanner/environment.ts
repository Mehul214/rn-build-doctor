import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execa } from 'execa';
import type { HostEnvironment } from '../types.js';

export async function scanEnvironment(): Promise<HostEnvironment> {
  const platform = process.platform;
  const osType: 'macos' | 'linux' | 'windows' =
    platform === 'darwin' ? 'macos' : platform === 'win32' ? 'windows' : 'linux';

  const env: HostEnvironment = {
    os: osType,
    osRelease: `${os.type()} ${os.release()}`,
    nodeVersion: process.version,
    javaHome: process.env.JAVA_HOME,
    androidHome: process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT,
    androidSdkInstalled: false,
    installedBuildTools: [],
    installedPlatforms: [],
    installedNdkVersions: [],
    isCommandLineToolsOnly: false,
  };

  // 1. Probe Java
  try {
    const javaRes = await execa('javac', ['-version'], { timeout: 3000 }).catch(() =>
      execa('java', ['-version'], { timeout: 3000 })
    );
    const output = (javaRes.stdout || '') + (javaRes.stderr || '');
    env.javaVersion = parseJavaVersion(output);
  } catch {
    // Java not found
  }

  // 2. Probe Android SDK
  let sdkPath = env.androidHome;
  if (!sdkPath || !fs.existsSync(sdkPath)) {
    const defaultPaths: Record<string, string> = {
      macos: path.join(os.homedir(), 'Library', 'Android', 'sdk'),
      linux: path.join(os.homedir(), 'Android', 'Sdk'),
      windows: path.join(process.env.LOCALAPPDATA || 'C:\\', 'Android', 'Sdk'),
    };
    const candidate = defaultPaths[osType];
    if (candidate && fs.existsSync(candidate)) {
      sdkPath = candidate;
    }
  }

  if (sdkPath && fs.existsSync(sdkPath)) {
    env.androidHome = sdkPath;
    env.androidSdkInstalled = true;

    // Scan platforms
    const platformsDir = path.join(sdkPath, 'platforms');
    if (fs.existsSync(platformsDir)) {
      try {
        env.installedPlatforms = fs
          .readdirSync(platformsDir)
          .filter((dir) => dir.startsWith('android-'));
      } catch {
        // ignore
      }
    }

    // Scan build-tools
    const buildToolsDir = path.join(sdkPath, 'build-tools');
    if (fs.existsSync(buildToolsDir)) {
      try {
        env.installedBuildTools = fs
          .readdirSync(buildToolsDir)
          .filter((dir) => !dir.startsWith('.'));
      } catch {
        // ignore
      }
    }

    // Scan NDK
    const ndkDir = path.join(sdkPath, 'ndk');
    if (fs.existsSync(ndkDir)) {
      try {
        env.installedNdkVersions = fs
          .readdirSync(ndkDir)
          .filter((dir) => !dir.startsWith('.'));
      } catch {
        // ignore
      }
    }
  }

  // 3. Probe iOS tools (macOS only)
  if (osType === 'macos') {
    // Check xcode-select
    try {
      const selectRes = await execa('xcode-select', ['-p'], { timeout: 3000 });
      const devPath = selectRes.stdout.trim();
      env.xcodePath = devPath;
      if (devPath.includes('CommandLineTools')) {
        env.isCommandLineToolsOnly = true;
      }
    } catch {
      // ignore
    }

    // Check xcodebuild
    try {
      const xcodeRes = await execa('xcodebuild', ['-version'], { timeout: 4000 });
      const match = xcodeRes.stdout.match(/Xcode\s+([0-9.]+)/i);
      if (match) {
        env.xcodeVersion = match[1];
      }
    } catch {
      // xcodebuild not available or failed
    }

    // Check CocoaPods
    try {
      const podRes = await execa('pod', ['--version'], { timeout: 3000 });
      env.cocoapodsVersion = podRes.stdout.trim();
    } catch {
      // pod not found
    }

    // Check Ruby
    try {
      const rubyRes = await execa('ruby', ['-v'], { timeout: 3000 });
      const match = rubyRes.stdout.match(/ruby\s+([0-9.]+)/i);
      if (match) {
        env.rubyVersion = match[1];
      }
    } catch {
      // ruby not found
    }
  }

  // 4. Probe Watchman (macOS & Linux)
  if (osType !== 'windows') {
    try {
      const watchmanRes = await execa('watchman', ['--version'], { timeout: 3000 });
      env.watchmanVersion = watchmanRes.stdout.trim();
    } catch {
      // watchman not found
    }
  }

  return env;
}

export function parseJavaVersion(output: string): string | undefined {
  // e.g. "javac 17.0.10", "java version \"1.8.0_292\"", "openjdk version \"21.0.2\""
  const match =
    output.match(/(?:javac|java|openjdk)\s+version\s+["']?([0-9._]+)["']?/i) ||
    output.match(/(?:javac|java|openjdk)\s+([0-9._]+)/i);

  if (!match) return undefined;

  let raw = match[1];
  // Convert 1.8.x -> 8
  if (raw.startsWith('1.')) {
    const parts = raw.split('.');
    return parts[1];
  }
  return raw.split('.')[0];
}

