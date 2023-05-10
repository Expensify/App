import Config from '../CONFIG';
import * as ApiUtils from './ApiUtils';

// Absolute URLs (`/` or `//`) should be resolved from API ROOT
// Legacy attachments can come from either staging or prod, depending on the env they were uploaded by
// Both should be replaced and loaded from API ROOT of the current environment
const ORIGINS_TO_REPLACE = [
    '/+',
    Config.EXPENSIFY.EXPENSIFY_URL,
    Config.EXPENSIFY.STAGING_API_ROOT,
    Config.EXPENSIFY.DEFAULT_API_ROOT,
];

// Anything starting with a match from ORIGINS_TO_REPLACE
const ORIGIN_PATTERN = new RegExp(`^(${ORIGINS_TO_REPLACE.join('|')})`);

/**
 * When possible this function resolve URLs relative to API ROOT
 * - Absolute URLs like `/{path}`, become: `https://{API_ROOT}/{path}`
 * - Similarly for prod or staging URLs we replace the `https://www.expensify`
 * or `https://staging.expensify` part, with `https://{API_ROOT}`
 * - Unmatched URLs (non expensify) are returned with no modifications
 *
 * @param {String} url
 * @returns {String}
 */
export default function tryResolveUrlFromApiRoot(url) {
    const apiRoot = ApiUtils.getApiRoot({shouldUseSecure: false});
    return url.replace(ORIGIN_PATTERN, apiRoot);
}
