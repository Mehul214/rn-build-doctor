import semver from 'semver';
import type { DiagnosticIssue, DiagnosticContext, Rule, RuleCheckResult } from '../types.js';

interface AgpRequirement {
  agpMin: string;
  agpMaxExclusive?: string;
  requiredGradle: string;
}

const AGP_REQUIREMENTS: AgpRequirement[] = [
  { agpMin: '8.8.0', requiredGradle: '8.10.2' },
  { agpMin: '8.7.0', agpMaxExclusive: '8.8.0', requiredGradle: '8.9.0' },
  { agpMin: '8.5.0', agpMaxExclusive: '8.7.0', requiredGradle: '8.7.0' },
  { agpMin: '8.4.0', agpMaxExclusive: '8.5.0', requiredGradle: '8.6.0' },
  { agpMin: '8.3.0', agpMaxExclusive: '8.4.0', requiredGradle: '8.4.0' },
  { agpMin: '8.2.0', agpMaxExclusive: '8.3.0', requiredGradle: '8.2.0' },
  { agpMin: '8.1.0', agpMaxExclusive: '8.2.0', requiredGradle: '8.1.0' },
  { agpMin: '8.0.0', agpMaxExclusive: '8.1.0', requiredGradle: '8.0.0' },
  { agpMin: '7.4.0', agpMaxExclusive: '8.0.0', requiredGradle: '7.5.0' },
  { agpMin: '7.3.0', agpMaxExclusive: '7.4.0', requiredGradle: '7.4.0' },
  { agpMin: '7.2.0', agpMaxExclusive: '7.3.0', requiredGradle: '7.3.3' },
  { agpMin: '7.1.0', agpMaxExclusive: '7.2.0', requiredGradle: '7.2.0' },
  { agpMin: '7.0.0', agpMaxExclusive: '7.1.0', requiredGradle: '7.0.0' },
];

export const gradleRule: Rule = {
  id: 'gradle-agp-compatibility',
  name: 'Gradle & Android Gradle Plugin (AGP) Compatibility',
  category: 'android',
  check: async (context: DiagnosticContext): Promise<RuleCheckResult> => {
    const issues: DiagnosticIssue[] = [];
    const { android } = context;

    if (!android.hasAndroidDir) {
      return {
        ruleId: 'gradle-agp-compatibility',
        ruleName: 'Gradle & Android Gradle Plugin (AGP) Compatibility',
        category: 'android',
        passed: true,
        issues: [],
      };
    }

    // 1. Missing Gradle wrapper
    if (!android.gradleWrapperVersion) {
      issues.push({
        id: 'WARN_NO_GRADLE_WRAPPER',
        title: 'Gradle Wrapper Not Found',
        severity: 'warning',
        category: 'android',
        message: 'Could not detect Gradle wrapper version from android/gradle/wrapper/gradle-wrapper.properties.',
        suggestion: 'Run "gradle wrapper" to generate the standard Gradle wrapper.',
        fixCommand: 'gradle wrapper',
        docsUrl: 'https://docs.gradle.org/current/userguide/gradle_wrapper.html',
      });
      return {
        ruleId: 'gradle-agp-compatibility',
        ruleName: 'Gradle & Android Gradle Plugin (AGP) Compatibility',
        category: 'android',
        passed: true,
        issues,
      };
    }

    const currentGradle = semver.coerce(android.gradleWrapperVersion);

    // 2. AGP to Gradle match
    if (android.agpVersion && currentGradle) {
      const currentAgp = semver.coerce(android.agpVersion);
      if (currentAgp) {
        for (const req of AGP_REQUIREMENTS) {
          const min = semver.coerce(req.agpMin)!;
          const max = req.agpMaxExclusive ? semver.coerce(req.agpMaxExclusive)! : null;
          const requiredGradleVer = semver.coerce(req.requiredGradle)!;

          const matchesAgp = max
            ? semver.gte(currentAgp, min) && semver.lt(currentAgp, max)
            : semver.gte(currentAgp, min);

          if (matchesAgp) {
            if (semver.lt(currentGradle, requiredGradleVer)) {
              issues.push({
                id: 'ERR_AGP_GRADLE_MISMATCH',
                title: 'Android Gradle Plugin (AGP) & Gradle Mismatch',
                severity: 'error',
                category: 'android',
                message: `Android Gradle Plugin ${android.agpVersion} requires Gradle ${req.requiredGradle} or higher, but your project is using Gradle ${android.gradleWrapperVersion}.`,
                suggestion: `Update your Gradle wrapper distributionUrl to Gradle ${req.requiredGradle} or higher.`,
                fixCommand: `cd android && ./gradlew wrapper --gradle-version ${req.requiredGradle}`,
                docsUrl: 'https://developer.android.com/build/releases/gradle-plugin#updating-gradle',
              });
            }
            break;
          }
        }
      }
    }

    // 3. Very old Gradle versions (< 7.0)
    if (currentGradle && semver.lt(currentGradle, '7.0.0')) {
      issues.push({
        id: 'WARN_OUTDATED_GRADLE',
        title: 'Severely Outdated Gradle Version',
        severity: 'warning',
        category: 'android',
        message: `Your project uses Gradle ${android.gradleWrapperVersion}. Modern React Native versions require Gradle 8.x or 7.x.`,
        suggestion: 'Upgrade Gradle wrapper to a supported version (e.g. 8.8).',
        fixCommand: 'cd android && ./gradlew wrapper --gradle-version 8.8',
        docsUrl: 'https://reactnative.dev/docs/environment-setup',
      });
    }

    return {
      ruleId: 'gradle-agp-compatibility',
      ruleName: 'Gradle & Android Gradle Plugin (AGP) Compatibility',
      category: 'android',
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  },
};

