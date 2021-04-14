/**
 * Add / to the end of any URL if not already present
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
 * Add / to the start of any URL if not already present
 * @param {String} url
 * @returns {String}
 */
function addLeadingForwardSlash(url) {
    if (!url.startsWith('/')) {
        return `/${url}`;
    }
    return url;
}

export {
    addTrailingForwardSlash,
    addLeadingForwardSlash,
};
