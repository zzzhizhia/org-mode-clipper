import { escapeMarkdown } from '../string-utils';

export const link = (str: string, param?: string, outputFormat?: string): string => {
	if (!str.trim()) {
		return str;
	}

	let linkText = 'link';
	if (param) {
		// Remove outer parentheses if present
		param = param.replace(/^\((.*)\)$/, '$1');
		// Remove surrounding quotes (both single and double)
		linkText = param.replace(/^(['"])([\s\S]*)\1$/, '$2');
	}

	const encodeUrl = (url: string): string => {
		return url.replace(/ /g, '%20');
	};

	const formatLink = (text: string, url: string): string => {
		if (outputFormat === 'org') {
			return `[[${url}][${text}]]`;
		}
		return `[${escapeMarkdown(text)}](${encodeUrl(escapeMarkdown(url))})`;
	};

	const formatUrlOnly = (url: string): string => {
		if (outputFormat === 'org') {
			return `[[${url}][${linkText}]]`;
		}
		return `[${linkText}](${encodeUrl(escapeMarkdown(url))})`;
	};

	try {
		const data = JSON.parse(str);

		const processObject = (obj: any): string[] => {
			return Object.entries(obj).map(([key, value]) => {
				if (typeof value === 'object' && value !== null) {
					return processObject(value);
				}
				return formatLink(String(value), key);
			}).flat();
		};

		if (Array.isArray(data)) {
			const result = data.map(item => {
				if (typeof item === 'object' && item !== null) {
					return processObject(item);
				}
				return item ? formatUrlOnly(String(item)) : '';
			});
			return result.join('\n');
		} else if (typeof data === 'object' && data !== null) {
			return processObject(data).join('\n');
		}
	} catch (error) {
		// If parsing fails, treat it as a single URL string
		return formatUrlOnly(str);
	}

	return str;
};
