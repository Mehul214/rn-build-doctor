import type { DiagnosticReport } from '../types.js';

export function renderJsonReport(report: DiagnosticReport): string {
  return JSON.stringify(report, null, 2);
}
