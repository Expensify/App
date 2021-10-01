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
 * @param {String} url
 * @returns {String|null}
 */
function getPath(url) {
    try {
        return new URL(url).pathname;
    } catch (e) {
        console.debug(`Error: Could not parse URL ${url}`);
        return null;
    }
}

export {
    addTrailingForwardSlash,
    getPath,
};
