import { describe, test, expect } from 'vitest';
import { getFormatter } from './index';

// ---------------------------------------------------------------------------
// getFormatter registry
// ---------------------------------------------------------------------------

describe('getFormatter', () => {
  test('returns markdown formatter by default', () => {
    const fmt = getFormatter();
    expect(fmt.format).toBe('md');
    expect(fmt.fileExtension).toBe('md');
  });

  test('returns markdown formatter for "md"', () => {
    const fmt = getFormatter('md');
    expect(fmt.format).toBe('md');
  });

  test('returns org formatter for "org"', () => {
    const fmt = getFormatter('org');
    expect(fmt.format).toBe('org');
    expect(fmt.fileExtension).toBe('org');
  });

  test('returns markdown formatter for unknown format', () => {
    const fmt = getFormatter('asciidoc');
    expect(fmt.format).toBe('md');
  });

  test('returns markdown formatter for empty string', () => {
    const fmt = getFormatter('');
    expect(fmt.format).toBe('md');
  });
});

// ---------------------------------------------------------------------------
// Org formatter — formatMeta (property drawer)
// ---------------------------------------------------------------------------

describe('orgFormatter.formatMeta', () => {
  const fmt = getFormatter('org');

  test('generates property drawer for basic text properties', () => {
    const result = fmt.formatMeta(
      [
        { name: 'title', value: 'Hello World' },
        { name: 'author', value: 'Alice' },
      ],
      {}
    );
    expect(result).toBe(':PROPERTIES:\n:title: Hello World\n:author: Alice\n:END:\n');
  });

  test('returns empty string for empty properties', () => {
    expect(fmt.formatMeta([], {})).toBe('');
  });

  test('handles empty property values', () => {
    const result = fmt.formatMeta(
      [{ name: 'empty', value: '' }],
      {}
    );
    expect(result).toBe(':PROPERTIES:\n:empty:\n:END:\n');
  });

  test('handles multitext type as space-separated values', () => {
    const result = fmt.formatMeta(
      [{ name: 'tags', value: 'tag1, tag2, tag3' }],
      { tags: 'multitext' }
    );
    expect(result).toBe(':PROPERTIES:\n:tags: tag1 tag2 tag3\n:END:\n');
  });

  test('handles multitext type with JSON array', () => {
    const result = fmt.formatMeta(
      [{ name: 'tags', value: '["tag1","tag2"]' }],
      { tags: 'multitext' }
    );
    expect(result).toBe(':PROPERTIES:\n:tags: tag1 tag2\n:END:\n');
  });

  test('handles number type', () => {
    const result = fmt.formatMeta(
      [{ name: 'count', value: '42' }],
      { count: 'number' }
    );
    expect(result).toBe(':PROPERTIES:\n:count: 42\n:END:\n');
  });

  test('handles number type with non-numeric characters', () => {
    const result = fmt.formatMeta(
      [{ name: 'price', value: '$19.99 USD' }],
      { price: 'number' }
    );
    expect(result).toBe(':PROPERTIES:\n:price: 19.99\n:END:\n');
  });

  test('handles checkbox type', () => {
    const result = fmt.formatMeta(
      [{ name: 'done', value: 'true' }],
      { done: 'checkbox' }
    );
    expect(result).toBe(':PROPERTIES:\n:done: t\n:END:\n');
  });

  test('handles checkbox type with false', () => {
    const result = fmt.formatMeta(
      [{ name: 'done', value: 'false' }],
      { done: 'checkbox' }
    );
    expect(result).toBe(':PROPERTIES:\n:done: nil\n:END:\n');
  });

  test('handles date type', () => {
    const result = fmt.formatMeta(
      [{ name: 'created', value: '2024-01-15' }],
      { created: 'date' }
    );
    expect(result).toBe(':PROPERTIES:\n:created: 2024-01-15\n:END:\n');
  });

  test('escapes :END: in property values', () => {
    const result = fmt.formatMeta(
      [{ name: 'note', value: 'contains :END: marker' }],
      {}
    );
    // Value should not break the drawer structure
    expect(result).not.toContain('\n:END:\n:END:');
    expect(result).toMatch(/:note: contains .* marker/);
  });

  test('replaces newlines in property values with spaces', () => {
    const result = fmt.formatMeta(
      [{ name: 'desc', value: 'line1\nline2' }],
      {}
    );
    expect(result).toBe(':PROPERTIES:\n:desc: line1 line2\n:END:\n');
  });

  test('property names with special characters', () => {
    const result = fmt.formatMeta(
      [{ name: 'my-property', value: 'val' }],
      {}
    );
    expect(result).toContain(':my-property: val');
  });
});

// ---------------------------------------------------------------------------
// Markdown formatter — sanity check (wraps existing logic)
// ---------------------------------------------------------------------------

describe('markdownFormatter.formatMeta', () => {
  const fmt = getFormatter('md');

  test('generates YAML frontmatter', () => {
    const result = fmt.formatMeta(
      [{ name: 'title', value: 'Hello' }],
      {}
    );
    expect(result).toContain('---');
    expect(result).toContain('title: "Hello"');
  });
});
