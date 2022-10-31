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

function hasSameOrigin(url1, url2) {
    const host1 = new URL(url1).hostname;
    const host2 = new URL(url2).hostname;
    const host1WithoutW3 = host1.startsWith('www.') ? host1.replace('www.', '') : host1;
    const host2WithoutW3 = host2.startsWith('www.') ? host2.replace('www.', '') : host2;
    return host1WithoutW3 === host2WithoutW3;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    addTrailingForwardSlash,
    hasSameOrigin,
};
