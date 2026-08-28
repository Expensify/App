/**
 * `fetch` against the Cloudflare Access-protected QA origin: attaches the bearer token and recovers from an
 * expired one. Standalone on purpose. Nothing in the app routes to QA yet, so HttpUtils stays untouched.
 * This logic moves there once QA routing lands.
 */
import {getCloudflareSession, refreshCloudflareSession} from '@userActions/CloudflareSession';

import CONST from '@src/CONST';

import {isQAServerRequest} from './Config';

/** Thrown when the session can't be recovered. The caller has to start a fresh authorize round trip */
const CF_REAUTH_REQUIRED = 'Cloudflare re-authentication required';

/** Narrow on purpose: keeps the header merge below a plain object spread */
type QAAuthRequestOptions = {
    method?: string;
    headers?: Record<string, string>;
    body?: FormData | string;
};

/**
 * Attaches the bearer only for an exact match on the configured QA origin. On a 401 it refreshes once and
 * retries once, and a second 401 rejects with CF_REAUTH_REQUIRED. Transient refresh failures reject as-is.
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
        throw new Error(CF_REAUTH_REQUIRED);
    }

    const refreshResult = await refreshCloudflareSession(accessToken);
    if (refreshResult === 'reauth-required') {
        throw new Error(CF_REAUTH_REQUIRED);
    }

    return fetchWithQAAuth(url, options, true);
}

export default fetchWithQAAuth;
export {CF_REAUTH_REQUIRED};
