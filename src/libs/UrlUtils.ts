import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/**
 * Add / to the end of any URL if not present
 */
function addTrailingForwardSlash(url: string): string {
    if (!url.endsWith('/')) {
        return `${url}/`;
    }
    return url;
}

type BuildSecureDownloadURLParams = {
    baseURL: string;
    secureType: ValueOf<typeof CONST.SECURE_DOWNLOAD_TYPE>;
    fileName: string;
    downloadName: string;
    email: string;
};

/**
 * Builds a secure download URL for OldDot file downloads (PDF reports, CSV exports, etc.).
 */
function buildSecureDownloadURL({baseURL, secureType, fileName, downloadName, email}: BuildSecureDownloadURLParams): string {
    return `${addTrailingForwardSlash(baseURL)}secure?secureType=${secureType}&filename=${encodeURIComponent(fileName)}&downloadName=${encodeURIComponent(downloadName)}&email=${encodeURIComponent(email)}`;
}

export default addTrailingForwardSlash;
export {buildSecureDownloadURL};
