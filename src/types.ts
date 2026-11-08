export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'success';

export type PlatformCategory = 'android' | 'ios' | 'project' | 'environment';

export interface DiagnosticIssue {
  id: string;
  title: string;
  severity: 'error' | 'warning' | 'info';
  category: PlatformCategory;
  message: string;
  suggestion: string;
  fixCommand?: string;
  docsUrl?: string;
  meta?: Record<string, unknown>;
}

export interface RuleCheckResult {
  ruleId: string;
  ruleName: string;
  category: PlatformCategory;
  passed: boolean;
  issues: DiagnosticIssue[];
}

export interface ProjectInfo {
  name: string;
  root: string;
  isReactNative: boolean;
  reactNativeVersion?: string;
  isExpo: boolean;
  expoVersion?: string;
  newArchEnabled?: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface AndroidInfo {
  hasAndroidDir: boolean;
  gradleWrapperVersion?: string;
  agpVersion?: string;
  compileSdkVersion?: string;
  targetSdkVersion?: string;
  minSdkVersion?: string;
  buildToolsVersion?: string;
  ndkVersion?: string;
  kotlinVersion?: string;
  jvmArgs?: string;
  hasLocalProperties?: boolean;
  localPropertiesSdkDir?: string;
}

export interface IosInfo {
  hasIosDir: boolean;
  deploymentTarget?: string;
  usesFrameworks?: boolean;
  hasGemfile: boolean;
  podsInstalled: boolean;
  podfileLockExists: boolean;
  xcodeProjName?: string;
}

export interface HostEnvironment {
  os: 'macos' | 'linux' | 'windows';
  osRelease: string;
  nodeVersion: string;
  javaHome?: string;
  javaVersion?: string;
  androidHome?: string;
  androidSdkInstalled: boolean;
  installedBuildTools: string[];
  installedPlatforms: string[];
  installedNdkVersions: string[];
  xcodeVersion?: string;
  xcodePath?: string;
  isCommandLineToolsOnly: boolean;
  cocoapodsVersion?: string;
  rubyVersion?: string;
  watchmanVersion?: string;
}

export interface DiagnosticContext {
  project: ProjectInfo;
  android: AndroidInfo;
  ios: IosInfo;
  env: HostEnvironment;
  platformFilter?: 'android' | 'ios' | 'all';
  verbose: boolean;
}

export interface Rule {
  id: string;
  name: string;
  category: PlatformCategory;
  check: (context: DiagnosticContext) => Promise<RuleCheckResult>;
}

export interface DiagnosticReport {
  timestamp: string;
  rnBuildDoctorVersion: string;
  project: ProjectInfo;
  environment: HostEnvironment;
  androidInfo: AndroidInfo;
  iosInfo: IosInfo;
  results: RuleCheckResult[];
  summary: {
    totalChecks: number;
    passed: number;
    warnings: number;
    errors: number;
  };
}

