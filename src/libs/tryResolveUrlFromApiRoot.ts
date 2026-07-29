import Config from '@src/CONFIG';
import type {ReceiptSource} from '@src/types/onyx/Transaction';

import type {ImageSourcePropType} from 'react-native';

import proxyConfig from '../../config/proxyConfig';
import {getApiRoot} from './ApiUtils';

// Absolute URLs (`/` or `//`) should be resolved from API ROOT
// Legacy attachments can come from either staging or prod, depending on the env they were uploaded by
// Both should be replaced and loaded from API ROOT of the current environment
const ORIGINS_TO_REPLACE = ['/+', Config.EXPENSIFY.EXPENSIFY_URL, Config.EXPENSIFY.STAGING_API_ROOT, Config.EXPENSIFY.DEFAULT_API_ROOT];

// Anything starting with a match from ORIGINS_TO_REPLACE
const ORIGIN_PATTERN = new RegExp(`^(${ORIGINS_TO_REPLACE.join('|')})`);

/**
 * When possible this function resolve URLs relative to API ROOT
 * - Absolute URLs like `/{path}`, become: `https://{API_ROOT}/{path}`
 * - Similarly for prod or staging URLs we replace the `https://www.expensify`
 * or `https://staging.expensify` part, with `https://{API_ROOT}`
 * - Unmatched URLs (non expensify) are returned with no modifications
 */
function tryResolveUrlFromApiRoot(url: string): string;
function tryResolveUrlFromApiRoot(url: ImageSourcePropType): number;
function tryResolveUrlFromApiRoot(url: ReceiptSource): ReceiptSource;
function tryResolveUrlFromApiRoot(url: string | ImageSourcePropType | ReceiptSource): string | ImageSourcePropType | ReceiptSource;
function tryResolveUrlFromApiRoot(url: string | ImageSourcePropType | ReceiptSource): string | ImageSourcePropType | ReceiptSource {
    // in native, when we import an image asset, it will have a number representation which can be used in `source` of Image
    // in this case we can skip the url resolving
    if (typeof url !== 'string') {
        return url;
    }
    const apiRoot = getApiRoot({shouldUseSecure: false});

    // When using the staging web proxy, the URL might already include the `/staging/` proxy path.
    // In that case, do not replace the leading `/` again, as it would create `/staging/staging/...`.
    if (apiRoot === proxyConfig.STAGING && url.startsWith(apiRoot)) {
        return url;
    }

    return url.replace(ORIGIN_PATTERN, apiRoot);
}

export default tryResolveUrlFromApiRoot;
