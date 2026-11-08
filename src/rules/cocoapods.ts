import semver from 'semver';
import type { DiagnosticIssue, DiagnosticContext, Rule, RuleCheckResult } from '../types.js';

export const cocoapodsRule: Rule = {
  id: 'cocoapods-setup',
  name: 'CocoaPods Dependencies & Environment',
  category: 'ios',
  check: async (context: DiagnosticContext): Promise<RuleCheckResult> => {
    const issues: DiagnosticIssue[] = [];
    const { env, ios } = context;

    if (!ios.hasIosDir) {
      return {
        ruleId: 'cocoapods-setup',
        ruleName: 'CocoaPods Dependencies & Environment',
        category: 'ios',
        passed: true,
        issues: [],
      };
    }

    // 1. CocoaPods installed? (on macOS)
    if (env.os === 'macos') {
      if (!env.cocoapodsVersion) {
        issues.push({
          id: 'ERR_COCOAPODS_NOT_INSTALLED',
          title: 'CocoaPods Not Installed',
          severity: 'error',
          category: 'ios',
          message: 'CocoaPods CLI ("pod") is not found in your system PATH.',
          suggestion: 'Install CocoaPods using Homebrew or Ruby gem.',
          fixCommand: 'brew install cocoapods',
          docsUrl: 'https://guides.cocoapods.org/using/getting-started.html',
        });
        return {
          ruleId: 'cocoapods-setup',
          ruleName: 'CocoaPods Dependencies & Environment',
          category: 'ios',
          passed: false,
          issues,
        };
      }

      // 2. CocoaPods version check
      const podVer = semver.coerce(env.cocoapodsVersion);
      if (podVer && semver.lt(podVer, '1.14.0')) {
        issues.push({
          id: 'WARN_COCOAPODS_OUTDATED',
          title: 'CocoaPods Version May Not Support All Modern Features',
          severity: 'warning',
          category: 'ios',
          message: `Installed CocoaPods is version ${env.cocoapodsVersion}. Modern React Native recommends CocoaPods >= 1.14.0 for Apple privacy manifests and New Architecture support.`,
          suggestion: 'Update CocoaPods to the latest stable release.',
          fixCommand: 'brew upgrade cocoapods || sudo gem install cocoapods',
          docsUrl: 'https://cocoapods.org',
        });
      }
    }

    // 3. Pods installed check
    if (!ios.podsInstalled || !ios.podfileLockExists) {
      const installCmd = ios.hasGemfile
        ? 'bundle exec pod install'
        : 'pod install';

      issues.push({
        id: 'WARN_PODS_NOT_INSTALLED',
        title: 'iOS CocoaPods Dependencies Not Installed',
        severity: 'warning',
        category: 'ios',
        message: 'The ios/Pods directory or Podfile.lock is missing or incomplete. iOS builds will fail until pods are installed.',
        suggestion: `Run "${installCmd}" inside your ios/ directory.`,
        fixCommand: `cd ios && ${installCmd}`,
        docsUrl: 'https://reactnative.dev/docs/environment-setup',
      });
    }

    return {
      ruleId: 'cocoapods-setup',
      ruleName: 'CocoaPods Dependencies & Environment',
      category: 'ios',
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  },
};

