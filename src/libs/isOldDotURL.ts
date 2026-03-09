import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import {hasSameExpensifyOrigin} from './Url';

/**
 * Checks whether a URL points to an Old Dot domain (e.g. www.expensify.com)
 * rather than a New Dot domain (e.g. new.expensify.com).
 */
function isOldDotURL(url: string): boolean {
    const hasExpensifyOrigin = hasSameExpensifyOrigin(url, CONFIG.EXPENSIFY.EXPENSIFY_URL) || hasSameExpensifyOrigin(url, CONFIG.EXPENSIFY.STAGING_API_ROOT);
    if (!hasExpensifyOrigin) {
        return false;
    }

    // Ensure it doesn't match any New Dot prefix — if it does, it's a ND URL served from the same origin
    const hasNewDotOrigin =
        hasSameExpensifyOrigin(url, CONST.NEW_EXPENSIFY_URL) || hasSameExpensifyOrigin(url, CONST.STAGING_NEW_EXPENSIFY_URL) || url.startsWith(CONST.DEV_NEW_EXPENSIFY_URL);
    return !hasNewDotOrigin;
}

export default isOldDotURL;
