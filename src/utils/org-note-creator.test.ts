import { describe, test, expect } from 'vitest';
import { buildOrgProtocolUrl } from './org-note-creator';

describe('buildOrgProtocolUrl', () => {
	test('builds basic org-protocol URL', () => {
		const url = buildOrgProtocolUrl({
			url: 'https://example.com',
			title: 'Test',
			body: 'Hello',
		});
		expect(url).toBe('org-protocol://capture?url=https%3A%2F%2Fexample.com&title=Test&body=Hello');
	});

	test('includes template parameter when provided', () => {
		const url = buildOrgProtocolUrl({
			captureTemplate: 'w',
			url: 'https://example.com',
			title: 'Test',
			body: 'Hello',
		});
		expect(url).toContain('template=w');
		expect(url).toMatch(/^org-protocol:\/\/capture\?template=w&/);
	});

	test('encodes special characters in title and body', () => {
		const url = buildOrgProtocolUrl({
			url: 'https://example.com',
			title: 'Hello & World',
			body: 'Line 1\nLine 2',
		});
		expect(url).toContain('title=Hello%20%26%20World');
		expect(url).toContain('body=Line%201%0ALine%202');
	});

	test('handles CJK characters', () => {
		const url = buildOrgProtocolUrl({
			url: 'https://example.com',
			title: '你好世界',
			body: '内容',
		});
		expect(url).toContain('org-protocol://capture?');
		// Should be properly encoded
		expect(url).not.toContain('你好');
	});

	test('handles empty body', () => {
		const url = buildOrgProtocolUrl({
			url: 'https://example.com',
			title: 'Test',
			body: '',
		});
		expect(url).toContain('body=');
	});
});
