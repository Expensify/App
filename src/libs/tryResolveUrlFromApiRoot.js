import Config from '../CONFIG';

// Absolute URLs (`/` or `//`) should be resolved from API ROOT
// Legacy attachments can come from either staging or prod, depending on the env they were uploaded by
// Both should be replaced and loaded from API ROOT of the current environment
const ORIGINS_TO_REPLACE = ['/+', Config.EXPENSIFY.EXPENSIFY_URL, Config.EXPENSIFY.STAGING_EXPENSIFY_URL];

// Anything starting with a match from ORIGINS_TO_REPLACE
const ORIGIN_PATTERN = new RegExp(`^(${ORIGINS_TO_REPLACE.join('|')})`);

/**
 * When possible resolve sources relative to API ROOT
 * Updates applicable URLs, so they are accessed relative to URL_API_ROOT
 * - Absolute URLs like `/{path}`, become: `https://{API_ROOT}/{path}`
 * - Similarly for prod or staging URLs we replace the `https://www.expensify`
 * or `https://staging.expensify` part, with `https://{API_ROOT}`
 * - Unmatched URLs are returned with no modifications
 *
 * @param {String} url
 * @returns {String}
 */
export default function tryResolveUrlFromApiRoot(url) {
    return url.replace(ORIGIN_PATTERN, Config.EXPENSIFY.URL_API_ROOT);
}
