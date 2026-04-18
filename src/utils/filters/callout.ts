export const callout = (str: string, param?: string): string => {
	let type = 'info';
	let title = '';

	if (param) {
		param = param.replace(/^\((.*)\)$/, '$1');
		const params = param.split(/,(?=(?:(?:[^"']*["'][^"']*["'])*[^"']*$))/).map(p => {
			return p.trim().replace(/^(['"])([\s\S]*)\1$/, '$2');
		});

		if (params.length > 0) type = params[0] || type;
		if (params.length > 1) title = params[1] || title;
	}

	const blockType = type.toUpperCase();
	const header = title ? `#+BEGIN_${blockType} ${title}` : `#+BEGIN_${blockType}`;
	return `${header}\n${str}\n#+END_${blockType}`;
};
