export const wikilink = (str: string, param?: string, outputFormat?: string): string => {
	if (!str.trim()) {
		return str;
	}

	let alias = '';
	if (param) {
		// Remove outer parentheses if present
		param = param.replace(/^\((.*)\)$/, '$1');
		// Remove surrounding quotes (both single and double)
		alias = param.replace(/^(['"])([\s\S]*)\1$/, '$2');
	}

	const formatWikilink = (target: string, display?: string): string => {
		if (outputFormat === 'org') {
			return display ? `[[file:${target}][${display}]]` : `[[file:${target}]]`;
		}
		return display ? `[[${target}|${display}]]` : `[[${target}]]`;
	};

	try {
		const data = JSON.parse(str);

		const processObject = (obj: any): string[] => {
			return Object.entries(obj).map(([key, value]) => {
				if (typeof value === 'object' && value !== null) {
					return processObject(value);
				}
				return formatWikilink(key, String(value));
			}).flat();
		};

		if (Array.isArray(data)) {
			const result = data.flatMap(item => {
				if (typeof item === 'object' && item !== null) {
					return processObject(item);
				}
				return item ? formatWikilink(String(item), alias || undefined) : '';
			});
			return JSON.stringify(result);
		} else if (typeof data === 'object' && data !== null) {
			return JSON.stringify(processObject(data));
		}
	} catch (error) {
		// If parsing fails, treat it as a single string
		return formatWikilink(str, alias || undefined);
	}
	return str;
};
