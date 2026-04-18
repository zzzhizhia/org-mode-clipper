import dayjs from 'dayjs';
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

/** Org-mode timestamp format: <YYYY-MM-DD ddd> */
const ORG_DATE_FORMAT = '<YYYY-MM-DD ddd>';

export const date = (str: string, param?: string): string => {
	if (str === '') {
		return str;
	}

	const inputDate = str === 'now' ? new Date() : str;

	if (!param) {
		return dayjs(inputDate).format(ORG_DATE_FORMAT);
	}

	param = param.replace(/^\((.*)\)$/, '$1');

	const params = param.split(/,(?=(?:(?:[^"']*["'][^"']*["'])*[^"']*$))/).map(p => {
		return p.trim().replace(/^(['"])([\s\S]*)\1$/, '$2');
	});

	const [dateFormat, inputFormat] = params;

	const resolvedFormat = dateFormat === 'org' ? ORG_DATE_FORMAT : dateFormat;

	let d;
	if (inputFormat) {
		d = dayjs(inputDate, inputFormat, true);
	} else {
		d = dayjs(inputDate);
	}

	if (!d.isValid()) {
		console.error('Invalid date for date filter:', str);
		return str;
	}

	return d.format(resolvedFormat);
};
