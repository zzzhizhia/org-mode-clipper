import { Property } from '../types/types';

/**
 * Output format identifier.
 */
export type OutputFormat = 'md' | 'org';

/**
 * Interface for converting extracted HTML content and metadata
 * into a specific output format (Markdown, Org-mode, etc.).
 */
export interface OutputFormatter {
  /** File extension without dot (e.g. 'md', 'org') */
  readonly fileExtension: string;

  /** Format identifier */
  readonly format: OutputFormat;

  /**
   * Convert extracted HTML content to the target format.
   *
   * @param html - Cleaned HTML from Defuddle
   * @param url - Source page URL for resolving relative links
   * @returns Formatted content string
   */
  formatContent(html: string, url: string): string;

  /**
   * Serialize properties into the format's metadata block.
   * For Markdown: YAML frontmatter. For Org: property drawer.
   *
   * @param properties - Compiled property list
   * @param propertyTypes - Map of property name → type
   * @returns Metadata block string (includes delimiters)
   */
  formatMeta(properties: Property[], propertyTypes: Record<string, string>): string;
}
