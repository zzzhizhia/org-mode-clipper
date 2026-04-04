import { describe, test, expect } from 'vitest';
import { org_tags } from './org_tags';

describe('org_tags filter', () => {
	test('converts comma-separated tags to org format', () => {
		expect(org_tags('tag1, tag2, tag3')).toBe(':tag1:tag2:tag3:');
	});

	test('handles JSON array input', () => {
		expect(org_tags('["tag1","tag2"]')).toBe(':tag1:tag2:');
	});

	test('replaces spaces with underscores', () => {
		expect(org_tags('my tag, another tag')).toBe(':my_tag:another_tag:');
	});

	test('returns empty string for empty input', () => {
		expect(org_tags('')).toBe('');
		expect(org_tags('  ')).toBe('');
	});

	test('filters out empty items', () => {
		expect(org_tags('a,,b')).toBe(':a:b:');
	});

	test('handles single tag', () => {
		expect(org_tags('only')).toBe(':only:');
	});
});
