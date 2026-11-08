import semver from 'semver';
import type { DiagnosticIssue, DiagnosticContext, Rule, RuleCheckResult } from '../types.js';

export const xcodeRule: Rule = {
  id: 'xcode-environment',
  name: 'Xcode & iOS Toolchain',
  category: 'ios',
  check: async (context: DiagnosticContext): Promise<RuleCheckResult> => {
    const issues: DiagnosticIssue[] = [];
    const { env, ios } = context;

    if (!ios.hasIosDir) {
      return {
        ruleId: 'xcode-environment',
        ruleName: 'Xcode & iOS Toolchain',
        category: 'ios',
        passed: true,
        issues: [],
      };
    }

    // 1. Non-macOS check
    if (env.os !== 'macos') {
      issues.push({
        id: 'INFO_IOS_REQUIRES_MACOS',
        title: 'iOS Build Tools Require macOS',
        severity: 'info',
        category: 'ios',
        message: `Current operating system is ${env.os}. Building and testing iOS native apps requires macOS with Xcode.`,
        suggestion: 'Run iOS builds on macOS or use cloud CI (e.g. GitHub Actions macOS runners, EAS Build).',
        docsUrl: 'https://reactnative.dev/docs/environment-setup',
      });
      return {
        ruleId: 'xcode-environment',
        ruleName: 'Xcode & iOS Toolchain',
        category: 'ios',
        passed: true,
        issues,
      };
    }

    // 2. Check if xcode-select is pointing to CommandLineTools only
    if (env.isCommandLineToolsOnly) {
      issues.push({
        id: 'ERR_XCODE_SELECT_COMMAND_LINE_TOOLS',
        title: 'Active Developer Directory Is Set to Command Line Tools',
        severity: 'error',
        category: 'ios',
        message:
          'Your active developer directory is set to "/Library/Developer/CommandLineTools". React Native requires the full Xcode directory to compile iOS projects and launch simulators.',
        suggestion:
          'Point xcode-select to the full Xcode application developer folder.',
        fixCommand: 'sudo xcode-select -s /Applications/Xcode.app/Contents/Developer',
        docsUrl: 'https://reactnative.dev/docs/environment-setup',
      });
    }

    // 3. Check if Xcode is installed
    if (!env.xcodeVersion) {
      issues.push({
        id: 'ERR_XCODE_NOT_INSTALLED',
        title: 'Xcode Not Detected',
        severity: 'error',
        category: 'ios',
        message: 'Could not detect an installed Xcode version via "xcodebuild".',
        suggestion:
          'Install Xcode from the Mac App Store or download it from developer.apple.com.',
        docsUrl: 'https://developer.apple.com/xcode/',
      });
      return {
        ruleId: 'xcode-environment',
        ruleName: 'Xcode & iOS Toolchain',
        category: 'ios',
        passed: false,
        issues,
      };
    }

    // 4. Check Xcode version
    const xcodeVer = semver.coerce(env.xcodeVersion);
    if (xcodeVer) {
      if (semver.lt(xcodeVer, '15.0.0')) {
        issues.push({
          id: 'WARN_XCODE_OUTDATED',
          title: 'Older Xcode Version Detected',
          severity: 'warning',
          category: 'ios',
          message: `Detected Xcode ${env.xcodeVersion}. Apple App Store and modern React Native versions require Xcode 15 or newer.`,
          suggestion: 'Update Xcode via Mac App Store.',
          docsUrl: 'https://developer.apple.com/support/xcode/',
        });
      }
    }

    return {
      ruleId: 'xcode-environment',
      ruleName: 'Xcode & iOS Toolchain',
      category: 'ios',
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  },
};

