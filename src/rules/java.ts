import semver from 'semver';
import type { DiagnosticIssue, DiagnosticContext, Rule, RuleCheckResult } from '../types.js';

export const javaRule: Rule = {
  id: 'java-compatibility',
  name: 'Java / JDK Compatibility',
  category: 'android',
  check: async (context: DiagnosticContext): Promise<RuleCheckResult> => {
    const issues: DiagnosticIssue[] = [];
    const { env, android, project } = context;

    // 1. Check if Java is installed at all
    if (!env.javaVersion) {
      issues.push({
        id: 'ERR_JAVA_NOT_INSTALLED',
        title: 'Java / JDK Not Detected',
        severity: 'error',
        category: 'android',
        message: 'No Java Development Kit (JDK) was found in your PATH.',
        suggestion:
          'Install OpenJDK 17 (recommended for React Native 0.73+) and ensure "javac" is in your system PATH.',
        fixCommand:
          env.os === 'macos'
            ? 'brew install openjdk@17 && sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk'
            : 'sudo apt-get install openjdk-17-jdk',
        docsUrl: 'https://reactnative.dev/docs/set-up-your-environment',
      });
      return {
        ruleId: 'java-compatibility',
        ruleName: 'Java / JDK Compatibility',
        category: 'android',
        passed: false,
        issues,
      };
    }

    const javaMajor = parseInt(env.javaVersion, 10);

    // 2. Check JAVA_HOME environment variable
    if (!env.javaHome) {
      issues.push({
        id: 'WARN_JAVA_HOME_MISSING',
        title: 'JAVA_HOME Environment Variable Not Set',
        severity: 'warning',
        category: 'environment',
        message:
          'The JAVA_HOME environment variable is not defined. Android Gradle builds may fail or pick up an unintended system runtime.',
        suggestion:
          'Set JAVA_HOME in your shell profile (~/.zshrc, ~/.bashrc, or Windows Environment Variables).',
        fixCommand:
          env.os === 'macos'
            ? 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)'
            : 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64',
        docsUrl: 'https://reactnative.dev/docs/set-up-your-environment',
      });
    }

    // 3. React Native version vs Java version
    const rnVersion = project.reactNativeVersion ? semver.coerce(project.reactNativeVersion) : null;

    if (rnVersion && semver.gte(rnVersion, '0.73.0')) {
      if (javaMajor < 17) {
        issues.push({
          id: 'ERR_JAVA_TOO_OLD_FOR_RN',
          title: 'Java Version Incompatible with React Native',
          severity: 'error',
          category: 'android',
          message: `Detected Java ${javaMajor}, but React Native ${project.reactNativeVersion} requires JDK 17 or newer.`,
          suggestion:
            'Upgrade your JDK to Java 17 (or Java 21 for modern Gradle 8.5+).',
          fixCommand:
            env.os === 'macos'
              ? 'brew install openjdk@17'
              : 'sudo apt install openjdk-17-jdk',
          docsUrl: 'https://reactnative.dev/docs/set-up-your-environment',
        });
      }
    } else if (javaMajor < 11) {
      issues.push({
        id: 'ERR_JAVA_LEGACY',
        title: 'Legacy Java Version Detected',
        severity: 'error',
        category: 'android',
        message: `Detected Java ${javaMajor}. Modern Android builds require at least JDK 11 (JDK 17 recommended).`,
        suggestion: 'Install OpenJDK 17.',
        docsUrl: 'https://reactnative.dev/docs/set-up-your-environment',
      });
    }

    // 4. Gradle vs Java version compatibility
    if (android.gradleWrapperVersion) {
      const gradleVer = semver.coerce(android.gradleWrapperVersion);
      if (gradleVer) {
        // Java 21 requires Gradle >= 8.5
        if (javaMajor >= 21 && semver.lt(gradleVer, '8.5.0')) {
          issues.push({
            id: 'ERR_JAVA_GRADLE_MISMATCH',
            title: 'Java 21 Incompatible with Configured Gradle Version',
            severity: 'error',
            category: 'android',
            message: `You are running Java ${javaMajor}, but Gradle ${android.gradleWrapperVersion} does not support Java 21 (Gradle 8.5+ is required).`,
            suggestion:
              'Either switch your JDK to Java 17, or upgrade your Gradle wrapper to 8.5 or higher.',
            fixCommand: 'cd android && ./gradlew wrapper --gradle-version 8.8',
            docsUrl: 'https://docs.gradle.org/current/userguide/compatibility.html',
          });
        }

        // Gradle < 7.3 doesn't support Java 17
        if (javaMajor >= 17 && semver.lt(gradleVer, '7.3.0')) {
          issues.push({
            id: 'ERR_JAVA17_GRADLE_TOO_OLD',
            title: 'Gradle Incompatible with Java 17',
            severity: 'error',
            category: 'android',
            message: `Gradle ${android.gradleWrapperVersion} does not support Java ${javaMajor}. Gradle 7.3+ is required for Java 17.`,
            suggestion: 'Upgrade your Gradle wrapper or downgrade JDK to Java 11.',
            docsUrl: 'https://docs.gradle.org/current/userguide/compatibility.html',
          });
        }
      }
    }

    return {
      ruleId: 'java-compatibility',
      ruleName: 'Java / JDK Compatibility',
      category: 'android',
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  },
};

