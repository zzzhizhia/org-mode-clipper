export const blockquote = (input: string | string[]): string => {
	const processBlockquote = (str: string): string =>
		`#+BEGIN_QUOTE\n${str}\n#+END_QUOTE`;

	const processArray = (arr: any[]): string => {
		return arr.map(item => {
			if (Array.isArray(item)) {
				return processArray(item);
			}
			return processBlockquote(String(item));
		}).join('\n');
	};

	try {
		const parsedInput = JSON.parse(input as string);
		if (Array.isArray(parsedInput)) {
			return processArray(parsedInput);
		}
		if (typeof parsedInput === 'object' && parsedInput !== null) {
			return processBlockquote(JSON.stringify(parsedInput, null, 2));
		}
		return processBlockquote(String(parsedInput));
	} catch (error) {
		if (Array.isArray(input)) {
			return processArray(input);
		}
		return processBlockquote(input as string);
	}
};
