import type { DiagnosticIssue, DiagnosticContext, Rule, RuleCheckResult } from '../types.js';

export const memoryRule: Rule = {
  id: 'gradle-memory-configuration',
  name: 'Gradle JVM Memory & Build Performance',
  category: 'android',
  check: async (context: DiagnosticContext): Promise<RuleCheckResult> => {
    const issues: DiagnosticIssue[] = [];
    const { android } = context;

    if (!android.hasAndroidDir) {
      return {
        ruleId: 'gradle-memory-configuration',
        ruleName: 'Gradle JVM Memory & Build Performance',
        category: 'android',
        passed: true,
        issues: [],
      };
    }

    const jvmArgs = android.jvmArgs || '';

    // Check for -Xmx
    const xmxMatch = jvmArgs.match(/-Xmx([0-9]+)([mgMG])/);

    if (!xmxMatch) {
      issues.push({
        id: 'WARN_JVM_HEAP_NOT_CONFIGURED',
        title: 'Gradle JVM Heap Limit Not Explicitly Configured',
        severity: 'warning',
        category: 'android',
        message:
          'No -Xmx memory limit is specified in android/gradle.properties. Default Gradle heap may cause OutOfMemory errors during Hermes compilation or bundling.',
        suggestion:
          'Add "org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m" to android/gradle.properties.',
        docsUrl: 'https://reactnative.dev/docs/build-speed#increase-max-memory',
      });
    } else {
      const amount = parseInt(xmxMatch[1], 10);
      const unit = xmxMatch[2].toLowerCase();
      const inMegabytes = unit === 'g' ? amount * 1024 : amount;

      if (inMegabytes < 2048) {
        issues.push({
          id: 'WARN_JVM_HEAP_TOO_LOW',
          title: 'Low Gradle JVM Heap Allocation',
          severity: 'warning',
          category: 'android',
          message: `Gradle is allocated only ${inMegabytes}MB heap space (-Xmx${xmxMatch[1]}${xmxMatch[2]}). React Native builds often fail with OutOfMemoryError with under 2048MB.`,
          suggestion: 'Increase -Xmx to at least -Xmx2048m (recommended: -Xmx4096m) in android/gradle.properties.',
          docsUrl: 'https://reactnative.dev/docs/build-speed#increase-max-memory',
        });
      }
    }

    return {
      ruleId: 'gradle-memory-configuration',
      ruleName: 'Gradle JVM Memory & Build Performance',
      category: 'android',
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  },
};

