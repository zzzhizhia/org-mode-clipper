/**
 * Denote-style file naming.
 *
 * Format: IDENTIFIER--TITLE__TAG1_TAG2.org
 *   - IDENTIFIER: YYYYMMDDTHHMMSS (local time)
 *   - TITLE: kebab-case, lowercase, ASCII-only
 *   - TAGS: optional, each lowercase alphanumeric
 *
 * Reference: https://protesilaos.com/emacs/denote
 */

export interface DenoteOptions {
	title: string;
	tags?: string[];
	date?: Date;
	extension?: string;
}

/**
 * Build a Denote-style filename.
 */
export function denoteFilename(opts: DenoteOptions): string {
	const date = opts.date ?? new Date();
	const ext = opts.extension ?? 'org';
	const identifier = denoteIdentifier(date);
	const slug = denoteSlug(opts.title);
	const tags = (opts.tags ?? []).map(denoteSlugTag).filter(Boolean);

	let name = identifier;
	if (slug) name += `--${slug}`;
	if (tags.length > 0) name += `__${tags.join('_')}`;
	return `${name}.${ext}`;
}

/**
 * Build the Denote identifier from a date: YYYYMMDDTHHMMSS (local time).
 */
export function denoteIdentifier(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return (
		date.getFullYear().toString() +
		pad(date.getMonth() + 1) +
		pad(date.getDate()) +
		'T' +
		pad(date.getHours()) +
		pad(date.getMinutes()) +
		pad(date.getSeconds())
	);
}

/**
 * Slugify a title for the Denote TITLE field.
 *
 * Preserves Unicode letters and digits (including CJK, Cyrillic, etc.) but
 * strips Latin diacritics via NFKD decomposition so "Café" becomes "cafe"
 * while "你好 world" becomes "你好-world".
 */
export function denoteSlug(input: string): string {
	return (input || '')
		.normalize('NFKD')
		.replace(/\p{M}+/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Slugify a tag: lowercase, Unicode letters/digits only, no separators.
 */
export function denoteSlugTag(input: string): string {
	return (input || '')
		.normalize('NFKD')
		.replace(/\p{M}+/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, '');
}
