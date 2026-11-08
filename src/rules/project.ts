import fs from 'node:fs';
import path from 'node:path';
import type { DiagnosticIssue, DiagnosticContext, Rule, RuleCheckResult } from '../types.js';

export const projectRule: Rule = {
  id: 'react-native-project-validation',
  name: 'React Native Project Structure & Dependencies',
  category: 'project',
  check: async (context: DiagnosticContext): Promise<RuleCheckResult> => {
    const issues: DiagnosticIssue[] = [];
    const { project } = context;

    // 1. Is it a React Native or Expo project?
    if (!project.isReactNative) {
      issues.push({
        id: 'ERR_NOT_A_REACT_NATIVE_PROJECT',
        title: 'Not a React Native Project',
        severity: 'error',
        category: 'project',
        message:
          'No "react-native" or "expo" dependency was found in package.json. rn-build-doctor is intended to be run in a React Native project directory.',
        suggestion:
          'Run this command in the root folder of your React Native application.',
        docsUrl: 'https://reactnative.dev',
      });
      return {
        ruleId: 'react-native-project-validation',
        ruleName: 'React Native Project Structure & Dependencies',
        category: 'project',
        passed: false,
        issues,
      };
    }

    // 2. Check if node_modules exists
    const nodeModulesPath = path.join(project.root, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      const pm = project.packageManager;
      const installCmd = pm === 'yarn' ? 'yarn install' : pm === 'pnpm' ? 'pnpm install' : pm === 'bun' ? 'bun install' : 'npm install';

      issues.push({
        id: 'ERR_NODE_MODULES_MISSING',
        title: 'Project Dependencies (node_modules) Missing',
        severity: 'error',
        category: 'project',
        message: 'The "node_modules" directory does not exist. Native module linkings and scripts cannot be resolved without dependencies installed.',
        suggestion: `Run "${installCmd}" to install your project packages.`,
        fixCommand: installCmd,
        docsUrl: 'https://reactnative.dev/docs/environment-setup',
      });
    }

    return {
      ruleId: 'react-native-project-validation',
      ruleName: 'React Native Project Structure & Dependencies',
      category: 'project',
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  },
};
