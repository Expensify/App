/**
 * Detects errors thrown by browser extension scripts that run inside our page. We can't fix those errors, so they should not be reported as App errors.
 */

/**
 * URL prefixes browser extensions inject code under. Safari hides the real URL of extension scripts behind webkit-masked-url://hidden/.
 */
const BROWSER_EXTENSION_URL_PATTERNS = [/^chrome-extension:\/\//i, /^moz-extension:\/\//i, /^safari-extension:\/\//i, /^safari-web-extension:\/\//i, /^webkit-masked-url:\/\/hidden\//i];

const URL_PATTERN = /[a-z][a-z0-9+.-]*:\/\/[^\s)]+/gi;

/**
 * @returns true only when every URL in the stack belongs to a browser extension, so errors that pass through App code are still reported
 */
function isBrowserExtensionError(error: Error): boolean {
    const stackURLs = error.stack?.match(URL_PATTERN);
    if (!stackURLs?.length) {
        return false;
    }

    return stackURLs.every((url) => BROWSER_EXTENSION_URL_PATTERNS.some((pattern) => pattern.test(url)));
}

export {BROWSER_EXTENSION_URL_PATTERNS};
export default isBrowserExtensionError;
