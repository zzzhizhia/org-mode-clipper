import { describe, test, expect } from 'vitest';
import { blockquote } from './blockquote';

describe('blockquote filter', () => {
	test('wraps single line in org quote block', () => {
		expect(blockquote('single line')).toBe('#+BEGIN_QUOTE\nsingle line\n#+END_QUOTE');
	});

	test('preserves internal newlines', () => {
		expect(blockquote('line1\nline2')).toBe('#+BEGIN_QUOTE\nline1\nline2\n#+END_QUOTE');
	});

	test('handles empty string', () => {
		expect(blockquote('')).toBe('#+BEGIN_QUOTE\n\n#+END_QUOTE');
	});

	test('handles array input', () => {
		const result = blockquote('["a","b"]');
		expect(result).toContain('#+BEGIN_QUOTE\na\n#+END_QUOTE');
		expect(result).toContain('#+BEGIN_QUOTE\nb\n#+END_QUOTE');
	});
});
