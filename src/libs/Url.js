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
 * Remove / to the end of any URL if present
 * @param {String} url
 * @returns {String}
 */
function removeTrailingForwardSlash(url) {
    if (url.endsWith('/')) {
        return url.slice(0, -1);
    }
    return url;
}


export {
    // eslint-disable-next-line import/prefer-default-export
    addTrailingForwardSlash,
    removeTrailingForwardSlash,
};
