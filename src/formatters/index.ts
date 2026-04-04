import { OutputFormatter, OutputFormat } from './types';
import { markdownFormatter } from './markdown';
import { orgFormatter } from './org';

export type { OutputFormatter, OutputFormat } from './types';

const formatters: Record<string, OutputFormatter> = {
  md: markdownFormatter,
  org: orgFormatter,
};

/**
 * Get a formatter by format identifier.
 * Returns markdown formatter for unknown/undefined formats.
 */
export function getFormatter(format?: string): OutputFormatter {
  if (!format) return markdownFormatter;
  return formatters[format] || markdownFormatter;
}
