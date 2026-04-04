/**
 * Convert comma-separated tags to org-mode tag format :tag1:tag2:tag3:
 * Org tags cannot contain spaces — they are replaced with underscores.
 */
export const org_tags = (str: string): string => {
	if (!str.trim()) return '';

	let items: string[];
	try {
		const parsed = JSON.parse(str);
		if (Array.isArray(parsed)) {
			items = parsed.map(String);
		} else {
			items = str.split(',').map(s => s.trim());
		}
	} catch {
		items = str.split(',').map(s => s.trim());
	}

	items = items.filter(s => s.length > 0).map(s => s.replace(/\s+/g, '_'));
	if (items.length === 0) return '';

	return ':' + items.join(':') + ':';
};
