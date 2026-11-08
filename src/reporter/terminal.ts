import chalk from 'chalk';
import type { DiagnosticReport, DiagnosticIssue } from '../types.js';

export function renderTerminalReport(
  report: DiagnosticReport,
  options: { verbose?: boolean } = {}
): void {
  const { summary, results, project, environment } = report;

  // Header Banner
  console.log();
  console.log(
    chalk.bold.cyan(
      ' 🩺  RN Build Doctor '
    ) + chalk.dim(`v${report.rnBuildDoctorVersion}`)
  );
  console.log(
    chalk.dim(' Pre-flight diagnostic for React Native Android & iOS builds')
  );
  console.log();

  // Project Info
  const rnBadge = project.reactNativeVersion
    ? chalk.green(`React Native ${project.reactNativeVersion}`)
    : chalk.yellow('React Native not detected');

  const archBadge =
    project.newArchEnabled !== undefined
      ? project.newArchEnabled
        ? chalk.magenta('New Arch (Enabled)')
        : chalk.dim('Old Arch')
      : '';

  console.log(
    `${chalk.bold('Project:')} ${chalk.white(project.name)} [${rnBadge}] ${archBadge}`
  );
  console.log(
    `${chalk.bold('Host OS:')} ${chalk.white(environment.osRelease)} | Node ${chalk.white(environment.nodeVersion)}`
  );

  if (options.verbose) {
    console.log();
    console.log(chalk.bold.underline('Detected Environment Details:'));
    console.log(` • Java Version: ${environment.javaVersion || chalk.dim('None')}`);
    console.log(` • JAVA_HOME: ${environment.javaHome || chalk.dim('Not set')}`);
    console.log(` • ANDROID_HOME: ${environment.androidHome || chalk.dim('Not set')}`);
    if (environment.installedPlatforms.length > 0) {
      console.log(` • Installed Android Platforms: ${environment.installedPlatforms.join(', ')}`);
    }
    if (environment.os === 'macos') {
      console.log(` • Xcode: ${environment.xcodeVersion || chalk.dim('None')} (${environment.xcodePath || 'No path'})`);
      console.log(` • CocoaPods: ${environment.cocoapodsVersion || chalk.dim('None')}`);
    }
  }

  console.log();
  console.log(chalk.dim('─'.repeat(64)));

  // Collect all issues
  const allIssues: DiagnosticIssue[] = [];
  for (const res of results) {
    allIssues.push(...res.issues);
  }

  const errors = allIssues.filter((i) => i.severity === 'error');
  const warnings = allIssues.filter((i) => i.severity === 'warning');
  const infos = allIssues.filter((i) => i.severity === 'info');

  // Summary Counters
  const summaryParts = [
    chalk.green.bold(`✔ ${summary.passed} checks passed`),
    warnings.length > 0
      ? chalk.yellow.bold(`⚠ ${warnings.length} warning${warnings.length > 1 ? 's' : ''} found`)
      : chalk.dim('0 warnings'),
    errors.length > 0
      ? chalk.red.bold(`✖ ${errors.length} error${errors.length > 1 ? 's' : ''} found`)
      : chalk.green.bold('0 errors'),
  ];
  console.log(summaryParts.join('   '));
  console.log(chalk.dim('─'.repeat(64)));
  console.log();

  // Print Errors
  if (errors.length > 0) {
    console.log(chalk.bgRed.black.bold(' ERRORS '));
    console.log();
    errors.forEach((issue, idx) => {
      printIssueCard(issue, idx + 1, 'error');
    });
  }

  // Print Warnings
  if (warnings.length > 0) {
    console.log(chalk.bgYellow.black.bold(' WARNINGS '));
    console.log();
    warnings.forEach((issue, idx) => {
      printIssueCard(issue, idx + 1, 'warning');
    });
  }

  // Print Info (if verbose or present)
  if (infos.length > 0 && options.verbose) {
    console.log(chalk.bgBlue.black.bold(' INFORMATIONAL '));
    console.log();
    infos.forEach((issue, idx) => {
      printIssueCard(issue, idx + 1, 'info');
    });
  }

  // Final Health Verdict
  console.log();
  if (errors.length === 0 && warnings.length === 0) {
    console.log(
      chalk.green.bold('✨ All checks passed! Your React Native build environment is healthy.')
    );
  } else if (errors.length === 0) {
    console.log(
      chalk.yellow.bold('⚠️  Build may succeed, but some warnings should be addressed for stability.')
    );
  } else {
    console.log(
      chalk.red.bold('🚨 Build is likely to fail! Please resolve the errors above before running gradle or xcodebuild.')
    );
  }

  // Donation / Sponsor Banner
  console.log();
  console.log(chalk.dim('─'.repeat(64)));
  console.log(
    chalk.bold.yellow(' ⭐ Enjoying rn-build-doctor? ') +
      chalk.dim('Support open-source development!')
  );
  console.log(
    ` ☕ Buy Me a Coffee: ${chalk.cyan('https://www.buymeacoffee.com/rnbuilddoctor')}`
  );
  console.log(
    ` 💖 GitHub Sponsors:  ${chalk.cyan('https://github.com/sponsors/mehul')}`
  );
  console.log(chalk.dim('─'.repeat(64)));
  console.log();
}

function printIssueCard(
  issue: DiagnosticIssue,
  num: number,
  type: 'error' | 'warning' | 'info'
): void {
  const numStr = String(num).padStart(2, '0');
  const badge =
    type === 'error'
      ? chalk.red.bold(`[ERROR ${numStr}]`)
      : type === 'warning'
      ? chalk.yellow.bold(`[WARN ${numStr}]`)
      : chalk.blue.bold(`[INFO ${numStr}]`);

  console.log(`${badge} ${chalk.bold.white(issue.title)}`);
  console.log(`  ${chalk.dim('Problem:')}     ${issue.message}`);
  console.log(`  ${chalk.dim('Action:')}      ${chalk.italic(issue.suggestion)}`);

  if (issue.fixCommand) {
    console.log(
      `  ${chalk.dim('Suggested:')}   ${chalk.bgGray.black(` ${issue.fixCommand} `)}`
    );
  }
  if (issue.docsUrl) {
    console.log(`  ${chalk.dim('Reference:')}   ${chalk.underline.blue(issue.docsUrl)}`);
  }
  console.log();
}
