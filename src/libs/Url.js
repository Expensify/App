import Str from 'expensify-common/lib/str';

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

function removeLeadingForwardSlash(url) {
    if (Str.startsWith(url, '/')) {
        return url.slice(1);
    }
    return url;
}

export {
    addTrailingForwardSlash,
    removeLeadingForwardSlash,
};
