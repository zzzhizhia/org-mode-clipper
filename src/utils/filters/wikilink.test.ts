import { describe, test, expect } from 'vitest';
import { wikilink } from './wikilink';

describe('wikilink filter', () => {
	test('creates org file link from string', () => {
		expect(wikilink('page')).toBe('[[file:page]]');
	});

	test('creates org file link with description', () => {
		expect(wikilink('page', 'alias')).toBe('[[file:page][alias]]');
	});

	test('handles array of pages', () => {
		const result = wikilink('["page1","page2"]');
		expect(result).toContain('[[file:page1]]');
		expect(result).toContain('[[file:page2]]');
	});

	test('handles array with alias', () => {
		const result = wikilink('["page1","page2"]', 'alias');
		expect(result).toContain('[[file:page1][alias]]');
		expect(result).toContain('[[file:page2][alias]]');
	});

	test('handles object with aliases', () => {
		const result = wikilink('{"page1": "alias1", "page2": "alias2"}');
		expect(result).toContain('[[file:page1][alias1]]');
		expect(result).toContain('[[file:page2][alias2]]');
	});

	test('handles empty string', () => {
		expect(wikilink('')).toBe('');
	});

	test('removes quotes from alias parameter', () => {
		expect(wikilink('page', '"alias"')).toBe('[[file:page][alias]]');
	});
});
