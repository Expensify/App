/**
 * `fetch` against the Cloudflare Access-protected QA origin: attaches the bearer token and recovers from an
 * expired one. Standalone on purpose — nothing in the app routes to QA yet, so HttpUtils stays untouched;
 * this logic moves there once QA routing lands.
 */
import {getCloudflareSession, refreshCloudflareSession} from '@userActions/CloudflareSession';

import CONST from '@src/CONST';

import {isQAServerRequest} from './Config';

/** Thrown when the session can't be recovered — the caller has to start a fresh authorize round trip */
const CF_REAUTH_REQUIRED = 'Cloudflare re-authentication required';

/** Narrow on purpose: keeps the header merge below a plain object spread */
type QAAuthRequestOptions = {
    method?: string;
    headers?: Record<string, string>;
    body?: FormData | string;
};

/**
 * Attaches the bearer only for an exact match on the configured QA origin. On a 401: one refresh, one retry;
 * a second 401 rejects with CF_REAUTH_REQUIRED. Transient refresh failures reject as-is, session intact.
 */
async function fetchWithQAAuth(url: string, options: QAAuthRequestOptions = {}, isRetry = false): Promise<Response> {
    const accessToken = isQAServerRequest(url) ? (getCloudflareSession()?.accessToken ?? null) : null;

    const response = await fetch(url, {
        method: options.method,
        body: options.body,
        headers: accessToken ? {...options.headers, Authorization: `Bearer ${accessToken}`} : options.headers,
        // Same as HttpUtils: no cookies on API requests, the token travels in the header
        credentials: 'omit',
    });

    if (response.status !== CONST.HTTP_STATUS.UNAUTHORIZED || !accessToken) {
        return response;
    }

    if (isRetry) {
        // Refresh demonstrably can't fix this session — the caller has to start a fresh authorize round trip
        throw new Error(CF_REAUTH_REQUIRED);
    }

    const refreshResult = await refreshCloudflareSession(accessToken);
    if (refreshResult === 'reauth-required') {
        // Terminal — refresh cannot recover this session
        throw new Error(CF_REAUTH_REQUIRED);
    }

    // Retry once, picking up the rotated token from the cache
    return fetchWithQAAuth(url, options, true);
}

export default fetchWithQAAuth;
export {CF_REAUTH_REQUIRED};
