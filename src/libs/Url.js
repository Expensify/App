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
 * Add / to the end of any URL if not present
 * @param {String} url
 * @returns {String}
 */
function wrapWithForwardSlash(url) {
    const newUrl = addTrailingForwardSlash(url);
    if (newUrl.startsWith('/')) {
        return newUrl;
    }

    return `/${newUrl}`;
}


export {
    // eslint-disable-next-line import/prefer-default-export
    addTrailingForwardSlash,
    wrapWithForwardSlash,
};
