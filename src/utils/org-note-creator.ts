/**
 * Create notes via org-protocol:// URI scheme.
 *
 * org-protocol://capture?template=X&url=URL&title=TITLE&body=BODY
 *
 * This triggers Emacs org-capture when the org-protocol handler is registered.
 */

import { copyToClipboard } from './clipboard-utils';

/** Maximum URL length before falling back to clipboard */
const MAX_URI_LENGTH = 8000;

export interface OrgCaptureOptions {
	/** org-capture template key (single letter, e.g. 'w') */
	captureTemplate?: string;
	/** Source URL */
	url: string;
	/** Page title */
	title: string;
	/** Note body content */
	body: string;
}

/**
 * Build an org-protocol capture URI.
 */
export function buildOrgProtocolUrl(options: OrgCaptureOptions): string {
	const { captureTemplate, url, title, body } = options;
	const templateParam = captureTemplate ? `template=${encodeURIComponent(captureTemplate)}&` : '';
	return `org-protocol://capture?${templateParam}url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

/**
 * Open an org-protocol URL, using clipboard fallback for long content.
 */
export async function openOrgProtocol(options: OrgCaptureOptions): Promise<string> {
	const fullUri = buildOrgProtocolUrl(options);

	if (fullUri.length > MAX_URI_LENGTH) {
		// URI too long — copy body to clipboard and send URI without body
		const success = await copyToClipboard(options.body);
		const shortUri = buildOrgProtocolUrl({ ...options, body: success ? '[clipboard]' : '' });
		window.open(shortUri, '_blank');
		return success
			? 'Opened org-protocol (body copied to clipboard)'
			: 'Opened org-protocol (body truncated — clipboard unavailable)';
	}

	window.open(fullUri, '_blank');
	return 'Opened org-protocol';
}
