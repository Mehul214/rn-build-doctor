import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { runDiagnostics } from '../src/engine/diagnostic.js';
import { renderJsonReport } from '../src/reporter/json.js';
import { renderMarkdownReport } from '../src/reporter/markdown.js';

describe('Diagnostic Engine & Reporters', () => {
  it('runs diagnostics on a mock project with filter', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-diag-test-'));
    try {
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({
          name: 'EngineTestApp',
          dependencies: {
            'react-native': '0.74.1',
          },
        })
      );

      const report = await runDiagnostics({
        cwd: tmpDir,
        platform: 'android',
        verbose: true,
      });

      expect(report.project.name).toBe('EngineTestApp');
      expect(report.project.isReactNative).toBe(true);
      expect(report.results.length).toBeGreaterThan(0);
      expect(typeof report.summary.passed).toBe('number');

      // Test JSON reporter
      const json = renderJsonReport(report);
      const parsed = JSON.parse(json);
      expect(parsed.project.name).toBe('EngineTestApp');

      // Test Markdown reporter
      const md = renderMarkdownReport(report);
      expect(md).toContain('# 🩺 React Native Build Health Report');
      expect(md).toContain('EngineTestApp');
      expect(md).toContain('Executive Summary');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
