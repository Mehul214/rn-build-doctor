import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { runDiagnostics } from '../engine/diagnostic.js';
import { renderTerminalReport } from '../reporter/terminal.js';
import { renderJsonReport } from '../reporter/json.js';
import { renderMarkdownReport } from '../reporter/markdown.js';

const program = new Command();

program
  .name('rn-build-doctor')
  .description('Pre-flight build diagnostic tool for React Native Android and iOS projects')
  .version('1.0.0')
  .argument('[platform]', 'Platform to diagnose (android, ios, or all)', 'all')
  .option('-v, --verbose', 'Show detailed diagnostic and environment information')
  .option('--json', 'Output results as JSON (ideal for CI/CD pipelines)')
  .option(
    '-r, --report [filename]',
    'Generate a shareable Markdown build health report (default: rn-build-doctor-report.md)'
  )
  .option('--cwd <path>', 'Specify project root directory', process.cwd())
  .option('--fix', 'Show guided fixes for detected issues')
  .action(async (platformArg: string, options: any) => {
    const validPlatforms = ['all', 'android', 'ios'];
    const platform = validPlatforms.includes(platformArg.toLowerCase())
      ? (platformArg.toLowerCase() as 'all' | 'android' | 'ios')
      : 'all';

    const isJson = Boolean(options.json);
    const isVerbose = Boolean(options.verbose);
    const cwd = path.resolve(options.cwd || process.cwd());

    let spinner: any = null;
    if (!isJson) {
      spinner = ora({
        text: chalk.cyan(`Scanning React Native project and diagnosing build health...`),
        color: 'cyan',
      }).start();
    }

    try {
      const report = await runDiagnostics({
        cwd,
        platform,
        verbose: isVerbose,
      });

      if (spinner) {
        spinner.stop();
      }

      // JSON output
      if (isJson) {
        console.log(renderJsonReport(report));
        process.exit(report.summary.errors > 0 ? 1 : 0);
      }

      // Terminal output
      renderTerminalReport(report, { verbose: isVerbose });

      // Shareable Markdown report output
      if (options.report !== undefined) {
        const filename =
          typeof options.report === 'string'
            ? options.report
            : 'rn-build-doctor-report.md';
        const targetPath = path.resolve(cwd, filename);
        const md = renderMarkdownReport(report);
        fs.writeFileSync(targetPath, md, 'utf-8');
        console.log(
          chalk.green(`📄 Shareable report generated: `) + chalk.bold(targetPath)
        );
        console.log();
      }

      // Guided fixes output
      if (options.fix) {
        console.log(chalk.bold.cyan('🛠️  Actionable Fix Commands:'));
        const fixableIssues = report.results
          .flatMap((r) => r.issues)
          .filter((i) => Boolean(i.fixCommand));

        if (fixableIssues.length === 0) {
          console.log(chalk.dim(' No automated fix commands available for currently detected issues.'));
        } else {
          fixableIssues.forEach((issue) => {
            console.log(
              ` • ${chalk.bold(issue.title)}:\n   ${chalk.bgGray.black(` ${issue.fixCommand} `)}`
            );
          });
        }
        console.log();
      }

      // Exit with error code if any critical errors
      if (report.summary.errors > 0) {
        process.exit(1);
      }
    } catch (err: any) {
      if (spinner) {
        spinner.fail(chalk.red('Diagnostic evaluation encountered an error.'));
      }
      console.error(chalk.red(err?.stack || err?.message || String(err)));
      process.exit(1);
    }
  });

program
  .command('android')
  .description('Run Android-specific build diagnostics')
  .option('-v, --verbose', 'Show detailed diagnostic output')
  .option('--json', 'Output results as JSON')
  .option('-r, --report [filename]', 'Generate a shareable Markdown build health report')
  .option('--cwd <path>', 'Specify project root directory', process.cwd())
  .option('--fix', 'Show guided fixes for detected issues')
  .action(async (options: any) => {
    await program.parseAsync(['node', 'rn-build-doctor', 'android', ...process.argv.slice(3)]);
  });

program
  .command('ios')
  .description('Run iOS-specific build diagnostics')
  .option('-v, --verbose', 'Show detailed diagnostic output')
  .option('--json', 'Output results as JSON')
  .option('-r, --report [filename]', 'Generate a shareable Markdown build health report')
  .option('--cwd <path>', 'Specify project root directory', process.cwd())
  .option('--fix', 'Show guided fixes for detected issues')
  .action(async (options: any) => {
    await program.parseAsync(['node', 'rn-build-doctor', 'ios', ...process.argv.slice(3)]);
  });

program.parse(process.argv);

