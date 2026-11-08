import semver from 'semver';
import type { DiagnosticIssue, DiagnosticContext, Rule, RuleCheckResult } from '../types.js';

export const nodeWatchmanRule: Rule = {
  id: 'node-watchman-environment',
  name: 'Node.js & Watchman Toolchain',
  category: 'environment',
  check: async (context: DiagnosticContext): Promise<RuleCheckResult> => {
    const issues: DiagnosticIssue[] = [];
    const { env } = context;

    // 1. Check Node.js version
    const nodeVer = semver.coerce(env.nodeVersion);
    if (nodeVer) {
      if (semver.lt(nodeVer, '18.0.0')) {
        issues.push({
          id: 'ERR_NODE_VERSION_TOO_OLD',
          title: 'Unsupported Node.js Version Detected',
          severity: 'error',
          category: 'environment',
          message: `Current Node.js version is ${env.nodeVersion}. React Native and Metro bundler require Node.js >= 18.0.0 (Node 20 LTS recommended).`,
          suggestion: 'Upgrade Node.js to Node 20 or 22 LTS via nvm or nodejs.org.',
          fixCommand: 'nvm install 20 && nvm use 20',
          docsUrl: 'https://reactnative.dev/docs/environment-setup',
        });
      }
    }

    // 2. Check Watchman (macOS & Linux)
    if (env.os === 'macos' && !env.watchmanVersion) {
      issues.push({
        id: 'WARN_WATCHMAN_NOT_INSTALLED',
        title: 'Watchman Not Installed',
        severity: 'warning',
        category: 'environment',
        message:
          'Watchman is not detected. React Native Metro bundler relies on Watchman to track file changes and avoid EMFILE file descriptor exhaustion errors.',
        suggestion: 'Install Watchman using Homebrew.',
        fixCommand: 'brew install watchman',
        docsUrl: 'https://facebook.github.io/watchman/docs/install.html',
      });
    }

    return {
      ruleId: 'node-watchman-environment',
      ruleName: 'Node.js & Watchman Toolchain',
      category: 'environment',
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  },
};

