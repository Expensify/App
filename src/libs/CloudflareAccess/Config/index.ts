/**
 * Config and request classification for the Cloudflare Access-protected QA server. The security boundary:
 * nothing else decides whether a URL may carry the QA bearer token.
 */
import CONFIG from '@src/CONFIG';

/** A bare hostname: no scheme, no slash, no port. Loose about labels (custom Access domains exist). */
const TEAM_DOMAIN_SHAPE = /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;

/** Anything short of a complete, well-formed config and every consumer behaves as if the feature is absent */
function isQAAuthConfigured(): boolean {
    const {API_ROOT, TEAM_DOMAIN, CLIENT_ID, CHECK_PATH} = CONFIG.QA_AUTH;

    if (!API_ROOT || !TEAM_DOMAIN || !CLIENT_ID || !CHECK_PATH) {
        return false;
    }

    if (!TEAM_DOMAIN_SHAPE.test(TEAM_DOMAIN)) {
        return false;
    }

    try {
        return new URL(API_ROOT).protocol === 'https:';
    } catch {
        return false;
    }
}

/** Origin form of the QA API root. Doubles as the RFC 8707 `resource` — CF binds the token to this string. */
function getQAOrigin(): string {
    return new URL(CONFIG.QA_AUTH.API_ROOT).origin;
}

/**
 * Exact-origin match, never a substring, and never true on an incomplete config. More Cloudflare-protected
 * QA hosts have to be added here deliberately.
 */
function isQAServerRequest(url: string): boolean {
    if (!isQAAuthConfigured()) {
        return false;
    }

    try {
        return new URL(url).origin === getQAOrigin();
    } catch {
        return false;
    }
}

/** Must be registered as an allowed redirect URI on the Access application. Read lazily: no `window` on native. */
function getOAuthRedirectURI(): string {
    return `${window.location.origin}/oauth/callback`;
}

export {getOAuthRedirectURI, getQAOrigin, isQAAuthConfigured, isQAServerRequest};
