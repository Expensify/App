/**
 * The local API proxy (`web/proxy.ts`) that Rsbuild forwards these paths to. The live Worker passes the same paths through
 * untouched, so this stays free of Worker types for the Rsbuild config, launcher, and proxy to import.
 */
const API_PROXY_PATHS = ['/api', '/staging', '/staging-secure', '/chat-attachments', '/receipts'];

// WEB_PROXY_PORT moves the proxy off the default when another local service already holds it. The Worker build has
// no process, so it falls back to the default there.
const API_PROXY_PORT = Number(typeof process === 'undefined' ? undefined : process.env?.WEB_PROXY_PORT) || 9000;

/** API and attachment responses must never enter the SPA fallback or HTML nonce/cache pipeline. */
function isAPIRequest(pathname: string): boolean {
    return API_PROXY_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export {API_PROXY_PATHS, API_PROXY_PORT, isAPIRequest};
