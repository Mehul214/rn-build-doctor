import semver from 'semver';
import type { DiagnosticIssue, DiagnosticContext, Rule, RuleCheckResult } from '../types.js';

export const kotlinRule: Rule = {
  id: 'kotlin-compatibility',
  name: 'Kotlin Version Compatibility',
  category: 'android',
  check: async (context: DiagnosticContext): Promise<RuleCheckResult> => {
    const issues: DiagnosticIssue[] = [];
    const { android, project } = context;

    if (!android.hasAndroidDir || !android.kotlinVersion) {
      return {
        ruleId: 'kotlin-compatibility',
        ruleName: 'Kotlin Version Compatibility',
        category: 'android',
        passed: true,
        issues: [],
      };
    }

    const kotlinVer = semver.coerce(android.kotlinVersion);
    const rnVer = project.reactNativeVersion ? semver.coerce(project.reactNativeVersion) : null;

    if (kotlinVer && rnVer) {
      if (semver.gte(rnVer, '0.74.0') && semver.lt(kotlinVer, '1.9.0')) {
        issues.push({
          id: 'WARN_KOTLIN_OUTDATED',
          title: 'Kotlin Version May Be Incompatible with React Native',
          severity: 'warning',
          category: 'android',
          message: `Project uses Kotlin ${android.kotlinVersion}. React Native ${project.reactNativeVersion} recommends Kotlin 1.9.0 or higher.`,
          suggestion: 'Update kotlinVersion to 1.9.24 or newer in android/build.gradle.',
          docsUrl: 'https://kotlinlang.org/docs/releases.html',
        });
      } else if (semver.lt(kotlinVer, '1.8.0')) {
        issues.push({
          id: 'WARN_KOTLIN_VERY_OLD',
          title: 'Legacy Kotlin Version Detected',
          severity: 'warning',
          category: 'android',
          message: `Project uses Kotlin ${android.kotlinVersion}. Modern Gradle plugins and libraries require at least Kotlin 1.8.0.`,
          suggestion: 'Update kotlinVersion in android/build.gradle.',
          docsUrl: 'https://kotlinlang.org/docs/releases.html',
        });
      }
    }

    return {
      ruleId: 'kotlin-compatibility',
      ruleName: 'Kotlin Version Compatibility',
      category: 'android',
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  },
};
