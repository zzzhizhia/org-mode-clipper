export const footnote = (str: string, _param?: string, outputFormat?: string): string => {
	// Return empty string as-is without attempting to parse
	if (str === '') {
		return str;
	}

	try {
		const data = JSON.parse(str);
		if (Array.isArray(data)) {
			if (outputFormat === 'org') {
				return data.map((item, index) => `[fn:${index + 1}] ${item}`).join('\n\n');
			}
			return data.map((item, index) => `[^${index + 1}]: ${item}`).join('\n\n');
		} else if (typeof data === 'object' && data !== null) {
			return Object.entries(data).map(([key, value]) => {
				const footnoteId = key.replace(/([a-z])([A-Z])/g, '$1-$2')
					.replace(/[\s_]+/g, '-')
					.toLowerCase();
				if (outputFormat === 'org') {
					return `[fn:${footnoteId}] ${value}`;
				}
				return `[^${footnoteId}]: ${value}`;
			}).join('\n\n');
		}
	} catch (error) {
		console.error('Error parsing JSON in footnote filter:', error);
	}
	return str;
};
