/**
 * Add / to the end of any URL if not present
 * @param {String} url
 * @returns {String}
 */
function addTrailingForwardSlash(url) {
    if (!url.endsWith('/')) {
        return `${url}/`;
    }
    return url;
}

/**
 * Get path from URL string
 * @param {String} url
 * @returns {String}
 */
function getPathFromURL(url) {
    const path = new URL(url).pathname;
    return path.substring(1); // Remove the leading '/'
}

/**
 * Determine if two urls have the same origin
 * @param {String} url1
 * @param {String} url2
 * @returns {Boolean}
 */
function hasSameExpensifyOrigin(url1, url2) {
    const removeW3 = (host) => host.replace(/^www\./i, '');

    const parsedUrl1 = new URL(url1);
    const parsedUrl2 = new URL(url2);

    return removeW3(parsedUrl1.host) === removeW3(parsedUrl2.host);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    addTrailingForwardSlash,
    hasSameExpensifyOrigin,
    getPathFromURL,
};
