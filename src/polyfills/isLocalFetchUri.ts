// URI schemes that reference local resources NitroFetch cannot read; these must use the native fetch.
const LOCAL_URI_SCHEMES = ['file:', 'content:', 'blob:', 'data:'];

function getRequestUrl(input: RequestInfo | URL): string {
    if (typeof input === 'string') {
        return input;
    }
    if (input instanceof URL) {
        return input.href;
    }
    return input.url;
}

/**
 * NitroFetch is an HTTP(S) network client and cannot read local resources, so a request to a local
 * URI scheme (e.g. a picked file, an attachment, or a blob) must be routed to the platform's native
 * fetch instead. Returns true when the request targets such a local URI.
 */
function isLocalFetchUri(input: RequestInfo | URL): boolean {
    const url = getRequestUrl(input).toLowerCase();
    return LOCAL_URI_SCHEMES.some((scheme) => url.startsWith(scheme));
}

export default isLocalFetchUri;
