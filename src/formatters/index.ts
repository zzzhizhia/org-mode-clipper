import { OutputFormatter } from './types';
import { orgFormatter } from './org';

export type { OutputFormatter, OutputFormat } from './types';

/**
 * Get the output formatter. Always returns the org-mode formatter.
 */
export function getFormatter(_format?: string): OutputFormatter {
  return orgFormatter;
}
