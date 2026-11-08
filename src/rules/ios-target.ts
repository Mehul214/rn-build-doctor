import semver from 'semver';
import type { DiagnosticIssue, DiagnosticContext, Rule, RuleCheckResult } from '../types.js';

export const iosTargetRule: Rule = {
  id: 'ios-deployment-target',
  name: 'iOS Deployment Target & Podfile Configuration',
  category: 'ios',
  check: async (context: DiagnosticContext): Promise<RuleCheckResult> => {
    const issues: DiagnosticIssue[] = [];
    const { ios, project } = context;

    if (!ios.hasIosDir) {
      return {
        ruleId: 'ios-deployment-target',
        ruleName: 'iOS Deployment Target & Podfile Configuration',
        category: 'ios',
        passed: true,
        issues: [],
      };
    }

    const targetVer = ios.deploymentTarget ? semver.coerce(ios.deploymentTarget) : null;
    const rnVer = project.reactNativeVersion ? semver.coerce(project.reactNativeVersion) : null;

    if (targetVer && rnVer) {
      let requiredIos = '12.4';
      if (semver.gte(rnVer, '0.74.0')) {
        requiredIos = '15.1';
      } else if (semver.gte(rnVer, '0.73.0')) {
        requiredIos = '13.4';
      }

      const requiredVer = semver.coerce(requiredIos)!;
      if (semver.lt(targetVer, requiredVer)) {
        issues.push({
          id: 'ERR_IOS_DEPLOYMENT_TARGET_TOO_LOW',
          title: 'iOS Deployment Target Too Low for React Native Version',
          severity: 'error',
          category: 'ios',
          message: `Your Podfile specifies iOS ${ios.deploymentTarget}, but React Native ${project.reactNativeVersion} requires at least iOS ${requiredIos}.`,
          suggestion: `Update the platform target in ios/Podfile to "platform :ios, '${requiredIos}'" and re-run pod install.`,
          fixCommand: `cd ios && pod install`,
          docsUrl: 'https://reactnative.dev/docs/environment-setup',
        });
      }
    }

    if (ios.usesFrameworks) {
      issues.push({
        id: 'INFO_USE_FRAMEWORKS_ENABLED',
        title: 'use_frameworks! Is Enabled in Podfile',
        severity: 'info',
        category: 'ios',
        message: 'Your Podfile specifies "use_frameworks!". Note that some React Native native modules require static linkage or "use_frameworks! :linkage => :static".',
        suggestion: 'If you encounter build errors with native Swift/ObjC modules, try using ":linkage => :static".',
        docsUrl: 'https://reactnative.dev/docs/new-architecture-app-modules-ios',
      });
    }

    return {
      ruleId: 'ios-deployment-target',
      ruleName: 'iOS Deployment Target & Podfile Configuration',
      category: 'ios',
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  },
};
