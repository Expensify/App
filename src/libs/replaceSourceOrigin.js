import Config from '../CONFIG';

// Absolute URLs (`/` or `//`) should be resolved from API ROOT
// Legacy attachments can come from either staging or prod, depending on the env they were uploaded by
// Both should be replaced and loaded from API ROOT of the current environment
const ORIGINS_TO_REPLACE = ['/+', Config.EXPENSIFY.EXPENSIFY_URL, Config.EXPENSIFY.STAGING_EXPENSIFY_URL];

// Anything starting with a match from ORIGINS_TO_REPLACE
const ORIGIN_PATTERN = new RegExp(`^(${ORIGINS_TO_REPLACE.join('|')})`);

/**
 * Updates URLs, so they are accessed relative to URL_API_ROOT
 * Matches: absolute, prod or staging URLs
 * Unmatched URLs aren't modified
 *
 * @param {String} url
 * @returns {String}
 */
export default function replaceSourceOrigin(url) {
    return url.replace(ORIGIN_PATTERN, Config.EXPENSIFY.URL_API_ROOT);
}
