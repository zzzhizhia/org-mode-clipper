import { OutputFormatter, OutputFormat } from './types';
import { Property } from '../types/types';
import { createMarkdownContent } from 'defuddle/full';
import { generateFrontmatter } from '../utils/shared';

/**
 * Markdown formatter — wraps existing Defuddle + YAML frontmatter logic.
 */
export const markdownFormatter: OutputFormatter = {
  fileExtension: 'md',
  format: 'md' as OutputFormat,

  formatContent(html: string, url: string): string {
    return createMarkdownContent(html, url);
  },

  formatMeta(properties: Property[], propertyTypes: Record<string, string>): string {
    return generateFrontmatter(properties, propertyTypes);
  },
};
