import type {
  DiagnosticContext,
  DiagnosticReport,
  PlatformCategory,
  RuleCheckResult,
} from '../types.js';
import { scanProject } from '../scanner/project.js';
import { scanAndroid } from '../scanner/android.js';
import { scanIos } from '../scanner/ios.js';
import { scanEnvironment } from '../scanner/environment.js';
import { ALL_RULES } from '../rules/index.js';

export interface RunDiagnosticOptions {
  cwd?: string;
  platform?: 'all' | 'android' | 'ios';
  verbose?: boolean;
}

export async function runDiagnostics(
  options: RunDiagnosticOptions = {}
): Promise<DiagnosticReport> {
  const cwd = options.cwd || process.cwd();
  const platformFilter = options.platform || 'all';
  const verbose = Boolean(options.verbose);

  // 1. Scan project and host environment
  const project = scanProject(cwd);
  const android = scanAndroid(cwd);
  const ios = scanIos(cwd);
  const env = await scanEnvironment();

  const context: DiagnosticContext = {
    project,
    android,
    ios,
    env,
    platformFilter,
    verbose,
  };

  // 2. Filter rules based on target platform
  const applicableRules = ALL_RULES.filter((rule) => {
    if (platformFilter === 'android') {
      return (
        rule.category === 'android' ||
        rule.category === 'project' ||
        rule.category === 'environment'
      );
    }
    if (platformFilter === 'ios') {
      return (
        rule.category === 'ios' ||
        rule.category === 'project' ||
        rule.category === 'environment'
      );
    }
    return true;
  });

  // 3. Execute all rules
  const results: RuleCheckResult[] = [];
  for (const rule of applicableRules) {
    try {
      const result = await rule.check(context);
      results.push(result);
    } catch (err: any) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        category: rule.category,
        passed: false,
        issues: [
          {
            id: 'ERR_RULE_EXECUTION_FAILURE',
            title: `Error evaluating rule "${rule.name}"`,
            severity: 'error',
            category: rule.category,
            message: err?.message || String(err),
            suggestion: 'Please report this issue to rn-build-doctor maintainers.',
          },
        ],
      });
    }
  }

  // 4. Compute statistics
  let passedCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  for (const res of results) {
    if (res.passed) {
      passedCount++;
    }
    for (const issue of res.issues) {
      if (issue.severity === 'error') {
        errorCount++;
      } else if (issue.severity === 'warning') {
        warningCount++;
      }
    }
  }

  const report: DiagnosticReport = {
    timestamp: new Date().toISOString(),
    rnBuildDoctorVersion: '1.0.1',
    project,
    environment: env,
    androidInfo: android,
    iosInfo: ios,
    results,
    summary: {
      totalChecks: results.length,
      passed: passedCount,
      warnings: warningCount,
      errors: errorCount,
    },
  };

  return report;
}

