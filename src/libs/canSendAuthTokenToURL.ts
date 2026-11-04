/**
 * Decides whether a URL may receive the user's encrypted auth token.
 *
 * The Expensify servers accept the encrypted auth token in place of a session to serve the user's private files.
 * Attachment URLs can come from places the App does not control, such as route params, so every place that adds the
 * token to a request checks the URL here first.
 */
import CONFIG from '@src/CONFIG';

// Each root ends with a slash, so a prefix match covers the whole host. A lookalike host such as
// `https://www.expensify.com.example.com/` does not match. Roots that are not configured are empty strings, and the web proxy
// root is the relative path `/`. Both get dropped here, and the leading slash check below covers the proxy.
const TRUSTED_URL_ROOTS = [
    CONFIG.EXPENSIFY.DEFAULT_API_ROOT,
    CONFIG.EXPENSIFY.DEFAULT_SECURE_API_ROOT,
    CONFIG.EXPENSIFY.EXPENSIFY_URL,
    CONFIG.EXPENSIFY.SECURE_EXPENSIFY_URL,
    CONFIG.EXPENSIFY.STAGING_API_ROOT,
    CONFIG.EXPENSIFY.STAGING_SECURE_API_ROOT,
    CONFIG.EXPENSIFY.QA_API_ROOT,
    CONFIG.EXPENSIFY.QA_SECURE_API_ROOT,
].filter((root) => /^https?:\/\/[^/]+\//.test(root));

// URL parsers drop tabs and line breaks and read a backslash as a slash. That turns text like `/\example.com/` into a link to another host.
// eslint-disable-next-line no-control-regex -- Control characters are exactly what this pattern needs to find.
const UNSAFE_URL_CHARACTERS = /[\u0000-\u001F\u007F\\]/;

function canSendAuthTokenToURL(url: string): boolean {
    if (UNSAFE_URL_CHARACTERS.test(url)) {
        return false;
    }

    // One leading slash keeps the request on the current origin, but two slashes start a URL on another host.
    if (url.startsWith('/')) {
        return !url.startsWith('//');
    }

    return TRUSTED_URL_ROOTS.some((root) => url.startsWith(root));
}

export default canSendAuthTokenToURL;
