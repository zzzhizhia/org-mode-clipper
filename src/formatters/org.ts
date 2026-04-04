import { OutputFormatter, OutputFormat } from './types';
import { Property } from '../types/types';

/**
 * Org-mode formatter — converts content to Org syntax
 * and metadata to property drawer format.
 */
export const orgFormatter: OutputFormatter = {
  fileExtension: 'org',
  format: 'org' as OutputFormat,

  formatContent(_html: string, _url: string): string {
    throw new Error('Not implemented');
  },

  formatMeta(_properties: Property[], _propertyTypes: Record<string, string>): string {
    throw new Error('Not implemented');
  },
};
