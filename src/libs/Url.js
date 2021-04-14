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

export {
    // eslint-disable-next-line import/prefer-default-export
    addTrailingForwardSlash,
};
