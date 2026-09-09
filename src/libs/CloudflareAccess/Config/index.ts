/**
 * Config and request classification for the Cloudflare Access-protected QA server. The security boundary:
 * nothing else decides whether a URL may carry the QA bearer token.
 */
import CONFIG from '@src/CONFIG';

import type {GetOAuthRedirectURI, GetQAOrigins, GetQAResource, IsQAAuthConfigured, IsQAServerRequest} from './types';

/** A bare hostname: no scheme, no slash, no port. Loose about labels (custom Access domains exist). */
const TEAM_DOMAIN_SHAPE = /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;

function parseHTTPSOrigin(value: string): string | null {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' ? url.origin : null;
    } catch {
        return null;
    }
}

/** Anything short of a complete, well-formed config and every consumer behaves as if the feature is absent */
const isQAAuthConfigured: IsQAAuthConfigured = () => {
    const {API_ROOT, SECURE_API_ROOT, TEAM_DOMAIN, CLIENT_ID} = CONFIG.QA_AUTH;

    if (!API_ROOT || !TEAM_DOMAIN || !CLIENT_ID) {
        return false;
    }

    if (!TEAM_DOMAIN_SHAPE.test(TEAM_DOMAIN)) {
        return false;
    }

    // A malformed secure root disables the feature outright: the shouldUseSecure commands would otherwise
    // go out bearer-less and 401 unrecoverably
    if (SECURE_API_ROOT && !parseHTTPSOrigin(SECURE_API_ROOT)) {
        return false;
    }

    return parseHTTPSOrigin(API_ROOT) !== null;
};

/** One token covers every allowlisted host only if they all belong to the same (multi-domain) Access application */
const getQAResource: GetQAResource = () => {
    // The `??` is unreachable behind the isQAAuthConfigured() gate that every caller sits under
    return parseHTTPSOrigin(CONFIG.QA_AUTH.API_ROOT) ?? '';
};

/** Entries are configured hosts, never inferred from the primary name */
const getQAOrigins: GetQAOrigins = () => {
    const {API_ROOT, SECURE_API_ROOT} = CONFIG.QA_AUTH;
    return [API_ROOT, SECURE_API_ROOT].map((root) => parseHTTPSOrigin(root)).filter((origin) => origin !== null);
};

const isQAServerRequest: IsQAServerRequest = (url) => {
    if (!isQAAuthConfigured()) {
        return false;
    }

    try {
        return getQAOrigins().includes(new URL(url).origin);
    } catch {
        return false;
    }
};

/** Must be registered as an allowed redirect URI on the Access application. Read lazily: no `window` on native. */
const getOAuthRedirectURI: GetOAuthRedirectURI = () => {
    return `${window.location.origin}/oauth/callback`;
};

export {getOAuthRedirectURI, getQAOrigins, getQAResource, isQAAuthConfigured, isQAServerRequest};
