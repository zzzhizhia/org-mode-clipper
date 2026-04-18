export const link = (str: string, param?: string): string => {
	if (!str.trim()) {
		return str;
	}

	let linkText = 'link';
	if (param) {
		param = param.replace(/^\((.*)\)$/, '$1');
		linkText = param.replace(/^(['"])([\s\S]*)\1$/, '$2');
	}

	const formatLink = (text: string, url: string): string => `[[${url}][${text}]]`;
	const formatUrlOnly = (url: string): string => `[[${url}][${linkText}]]`;

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
		return formatUrlOnly(str);
	}

	return str;
};
