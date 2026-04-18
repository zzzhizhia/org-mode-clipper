import { describe, test, expect } from 'vitest';
import { callout } from './callout';
import { render } from '../renderer';
import { applyFilters } from '../filters';

describe('callout filter', () => {
	test('creates default info callout', () => {
		const result = callout('content');
		expect(result).toBe('#+BEGIN_INFO\ncontent\n#+END_INFO');
	});

	test('creates callout with custom type', () => {
		const result = callout('content', 'warning');
		expect(result).toBe('#+BEGIN_WARNING\ncontent\n#+END_WARNING');
	});

	test('creates callout with title', () => {
		const result = callout('content', '("note", "My Title")');
		expect(result).toBe('#+BEGIN_NOTE My Title\ncontent\n#+END_NOTE');
	});

	test('handles empty content', () => {
		const result = callout('');
		expect(result).toBe('#+BEGIN_INFO\n\n#+END_INFO');
	});

	test('handles multiline content', () => {
		const result = callout('line1\nline2');
		expect(result).toContain('line1');
		expect(result).toContain('line2');
	});
});

describe('callout filter via renderer', () => {
	const createContext = (variables: Record<string, any> = {}) => ({
		variables,
		currentUrl: 'https://example.com',
		applyFilters,
	});

	test('callout with type and title through template', async () => {
		const ctx = createContext({ msg: 'content' });
		const result = await render('{{msg|callout:("info","My Title")}}', ctx);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toContain('#+BEGIN_INFO My Title');
		expect(result.output).toContain('content');
	});

	test('callout with just type through template', async () => {
		const ctx = createContext({ msg: 'content' });
		const result = await render('{{msg|callout:"warning"}}', ctx);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toContain('#+BEGIN_WARNING');
	});
});
