import type { DiagnosticReport, DiagnosticIssue } from '../types.js';

export function renderMarkdownReport(report: DiagnosticReport): string {
  const { summary, project, environment, androidInfo, iosInfo, results, timestamp } = report;

  const allIssues: DiagnosticIssue[] = [];
  for (const res of results) {
    allIssues.push(...res.issues);
  }

  const errors = allIssues.filter((i) => i.severity === 'error');
  const warnings = allIssues.filter((i) => i.severity === 'warning');

  const statusEmoji = errors.length > 0 ? '❌ Issues Detected' : warnings.length > 0 ? '⚠️ Warnings Found' : '✅ Healthy';

  let md = `# 🩺 React Native Build Health Report\n\n`;
  md += `**Generated:** ${new Date(timestamp).toUTCString()}  \n`;
  md += `**Status:** ${statusEmoji}  \n`;
  md += `**RN Build Doctor Version:** \`v${report.rnBuildDoctorVersion}\`\n\n`;

  md += `## 📊 Executive Summary\n\n`;
  md += `| Passed Checks | Warnings | Errors |\n`;
  md += `| :---: | :---: | :---: |\n`;
  md += `| **${summary.passed}** | **${summary.warnings}** | **${summary.errors}** |\n\n`;

  md += `## 📱 Project & Environment\n\n`;
  md += `### Project Info\n`;
  md += `- **Project Name:** \`${project.name}\`\n`;
  md += `- **React Native Version:** \`${project.reactNativeVersion || 'Not found'}\`\n`;
  md += `- **New Architecture:** \`${project.newArchEnabled !== undefined ? (project.newArchEnabled ? 'Enabled' : 'Disabled') : 'Default / Auto'}\`\n`;
  md += `- **Package Manager:** \`${project.packageManager}\`\n\n`;

  md += `### Host Environment\n`;
  md += `- **Operating System:** \`${environment.osRelease}\`\n`;
  md += `- **Node.js:** \`${environment.nodeVersion}\`\n`;
  md += `- **Java / JDK:** \`${environment.javaVersion || 'None'}\`\n`;
  md += `- **JAVA_HOME:** \`${environment.javaHome || 'Not set'}\`\n`;
  md += `- **ANDROID_HOME:** \`${environment.androidHome || 'Not set'}\`\n`;
  if (environment.os === 'macos') {
    md += `- **Xcode:** \`${environment.xcodeVersion || 'None'}\` (${environment.xcodePath || 'No path'})\n`;
    md += `- **CocoaPods:** \`${environment.cocoapodsVersion || 'None'}\`\n`;
    md += `- **Ruby:** \`${environment.rubyVersion || 'None'}\`\n`;
  }
  md += `\n`;

  if (androidInfo.hasAndroidDir) {
    md += `### Android Configuration\n`;
    md += `- **Gradle Wrapper:** \`${androidInfo.gradleWrapperVersion || 'Unknown'}\`\n`;
    md += `- **Android Gradle Plugin (AGP):** \`${androidInfo.agpVersion || 'Unknown'}\`\n`;
    md += `- **compileSdkVersion:** \`${androidInfo.compileSdkVersion || 'Default'}\`\n`;
    md += `- **targetSdkVersion:** \`${androidInfo.targetSdkVersion || 'Default'}\`\n`;
    md += `- **minSdkVersion:** \`${androidInfo.minSdkVersion || 'Default'}\`\n`;
    md += `- **Kotlin Version:** \`${androidInfo.kotlinVersion || 'Not specified'}\`\n`;
    md += `- **Gradle JVM Args:** \`${androidInfo.jvmArgs || 'Default'}\`\n\n`;
  }

  if (iosInfo.hasIosDir) {
    md += `### iOS Configuration\n`;
    md += `- **Deployment Target:** \`${iosInfo.deploymentTarget || 'Default'}\`\n`;
    md += `- **Podfile.lock Exists:** \`${iosInfo.podfileLockExists ? 'Yes' : 'No'}\`\n`;
    md += `- **Pods Installed:** \`${iosInfo.podsInstalled ? 'Yes' : 'No'}\`\n`;
    md += `- **Gemfile Used:** \`${iosInfo.hasGemfile ? 'Yes' : 'No'}\`\n\n`;
  }

  if (errors.length > 0) {
    md += `## 🚨 Critical Errors (Action Required)\n\n`;
    errors.forEach((err, idx) => {
      md += `### ${idx + 1}. ${err.title}\n`;
      md += `- **Problem:** ${err.message}\n`;
      md += `- **Suggested Action:** ${err.suggestion}\n`;
      if (err.fixCommand) {
        md += `- **Suggested Command:**\n  \`\`\`bash\n  ${err.fixCommand}\n  \`\`\`\n`;
      }
      if (err.docsUrl) {
        md += `- **Documentation:** [Read more](${err.docsUrl})\n`;
      }
      md += `\n`;
    });
  }

  if (warnings.length > 0) {
    md += `## ⚠️ Potential Issues & Warnings\n\n`;
    warnings.forEach((warn, idx) => {
      md += `### ${idx + 1}. ${warn.title}\n`;
      md += `- **Details:** ${warn.message}\n`;
      md += `- **Recommendation:** ${warn.suggestion}\n`;
      if (warn.fixCommand) {
        md += `- **Suggested Command:**\n  \`\`\`bash\n  ${warn.fixCommand}\n  \`\`\`\n`;
      }
      if (warn.docsUrl) {
        md += `- **Documentation:** [Read more](${warn.docsUrl})\n`;
      }
      md += `\n`;
    });
  }

  md += `## 💖 Support rn-build-doctor\n\n`;
  md += `If this tool saved you hours of debugging Gradle or Xcode errors, consider supporting its development:\n\n`;
  md += `- 💖 [GitHub Sponsors](https://github.com/sponsors/Mehul214)\n`;
  md += `- ☕ [Buy Me a Coffee](https://buymeacoffee.com/mehulreshac)\n`;
  md += `- 🇮🇳 **UPI (India):** \`mehulreshamwala7@okhdfcbank\` (Mehul Reshamwala)\n`;

  return md;
}

