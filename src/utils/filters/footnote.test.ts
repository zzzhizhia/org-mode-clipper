import { describe, test, expect } from 'vitest';
import { footnote } from './footnote';

describe('footnote filter', () => {
	test('converts array to org footnotes', () => {
		const result = footnote('["first item","second item"]');
		expect(result).toBe('[fn:1] first item\n\n[fn:2] second item');
	});

	test('converts object to org footnotes', () => {
		const result = footnote('{"First Note": "Content 1", "Second Note": "Content 2"}');
		expect(result).toContain('[fn:first-note] Content 1');
		expect(result).toContain('[fn:second-note] Content 2');
	});

	test('handles single item array', () => {
		const result = footnote('["only item"]');
		expect(result).toBe('[fn:1] only item');
	});

	test('handles empty array', () => {
		const result = footnote('[]');
		expect(result).toBe('');
	});

	test('returns original for non-JSON', () => {
		expect(footnote('plain text')).toBe('plain text');
	});
});
