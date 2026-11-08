import fs from 'node:fs';
import path from 'node:path';
import type { DiagnosticIssue, DiagnosticContext, Rule, RuleCheckResult } from '../types.js';

export const localPropertiesRule: Rule = {
  id: 'android-local-properties',
  name: 'Android local.properties Configuration',
  category: 'android',
  check: async (context: DiagnosticContext): Promise<RuleCheckResult> => {
    const issues: DiagnosticIssue[] = [];
    const { android, env, project } = context;

    if (!android.hasAndroidDir) {
      return {
        ruleId: 'android-local-properties',
        ruleName: 'Android local.properties Configuration',
        category: 'android',
        passed: true,
        issues: [],
      };
    }

    const localPropsPath = path.join(project.root, 'android', 'local.properties');

    // Case 1: local.properties exists, check if sdk.dir points to valid location
    if (android.hasLocalProperties && android.localPropertiesSdkDir) {
      if (!fs.existsSync(android.localPropertiesSdkDir)) {
        issues.push({
          id: 'ERR_INVALID_LOCAL_PROPERTIES_SDK_DIR',
          title: 'android/local.properties Points to Non-Existent SDK Path',
          severity: 'error',
          category: 'android',
          message: `The sdk.dir path "${android.localPropertiesSdkDir}" defined in android/local.properties does not exist on your computer.`,
          suggestion: env.androidHome
            ? `Update sdk.dir to your actual Android SDK path: "${env.androidHome}".`
            : 'Update sdk.dir in android/local.properties to point to your installed Android SDK.',
          fixCommand: env.androidHome
            ? `echo "sdk.dir=${env.androidHome}" > android/local.properties`
            : undefined,
          docsUrl: 'https://reactnative.dev/docs/environment-setup',
        });
      }
    } else if (!android.hasLocalProperties) {
      // Case 2: local.properties does not exist
      if (!env.androidHome) {
        issues.push({
          id: 'ERR_SDK_LOCATION_NOT_FOUND',
          title: 'Android SDK Location Missing (local.properties & ANDROID_HOME)',
          severity: 'error',
          category: 'android',
          message:
            'Gradle will fail with "SDK location not found". Neither android/local.properties exists nor is ANDROID_HOME defined.',
          suggestion:
            'Create android/local.properties with sdk.dir or define the ANDROID_HOME environment variable.',
          docsUrl: 'https://reactnative.dev/docs/environment-setup',
        });
      } else {
        issues.push({
          id: 'WARN_LOCAL_PROPERTIES_MISSING',
          title: 'android/local.properties File Missing',
          severity: 'info',
          category: 'android',
          message:
            'android/local.properties was not found. While ANDROID_HOME is set in your shell, some IDEs and Gradle daemons prefer having local.properties present.',
          suggestion: `Generate android/local.properties with sdk.dir=${env.androidHome}`,
          fixCommand: `echo "sdk.dir=${env.androidHome}" > android/local.properties`,
          docsUrl: 'https://reactnative.dev/docs/environment-setup',
        });
      }
    }

    return {
      ruleId: 'android-local-properties',
      ruleName: 'Android local.properties Configuration',
      category: 'android',
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  },
};
