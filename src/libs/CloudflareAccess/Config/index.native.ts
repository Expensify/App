/**
 * QA auth is web-only: receiving the OAuth callback needs claimed Universal/App Links, so the feature is
 * structurally off on native regardless of build configuration. Everything downstream gates on
 * isQAAuthConfigured(), which makes the remaining exports unreachable — they only satisfy the module shape.
 */
function isQAAuthConfigured(): boolean {
    return false;
}

function isQAServerRequest(): boolean {
    return false;
}

function getQAOrigin(): string {
    return '';
}

function getOAuthRedirectURI(): string {
    return '';
}

export {getOAuthRedirectURI, getQAOrigin, isQAAuthConfigured, isQAServerRequest};
