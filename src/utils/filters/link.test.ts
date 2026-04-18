import { describe, test, expect } from 'vitest';
import { link } from './link';

describe('link filter', () => {
	test('converts string to org link', () => {
		expect(link('https://example.com', 'Example'))
			.toBe('[[https://example.com][Example]]');
	});

	test('handles URL without link text', () => {
		const result = link('https://example.com');
		expect(result).toBe('[[https://example.com][link]]');
	});

	test('handles array of URLs', () => {
		const result = link('["url1","url2"]', 'Link');
		expect(result).toContain('[[url1][Link]]');
		expect(result).toContain('[[url2][Link]]');
	});

	test('handles object with link text values', () => {
		const result = link('{"url1": "Link 1", "url2": "Link 2"}');
		expect(result).toContain('[[url1][Link 1]]');
		expect(result).toContain('[[url2][Link 2]]');
	});

	test('handles empty string', () => {
		expect(link('')).toBe('');
	});
});
