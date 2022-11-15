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
 * Parse href to URL object
 * @param {String} href
 * @returns {Object}
 */
function getURLObject(href) {
    const urlRegex = new RegExp([
        '^(https?:)//', // protocol
        '(([^:/?#]*)(?::([0-9]+))?)', // host (hostname and port)
        '([^]*)', // pathname
    ].join(''));
    const match = href.match(urlRegex) || [];
    return {
        href: match[0],
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        path: match[5],
    };
}

/**
 * Determine if two urls have the same origin
 * @param {String} url1
 * @param {String} url2
 * @returns {Boolean}
 */
function hasSameOrigin(url1, url2) {
    const host1 = getURLObject(url1).hostname;
    const host2 = getURLObject(url2).hostname;
    if (!host1 || !host2) {
        return false;
    }
    const host1WithoutW3 = host1.startsWith('www.') ? host1.replace('www.', '') : host1;
    const host2WithoutW3 = host2.startsWith('www.') ? host2.replace('www.', '') : host2;
    return host1WithoutW3 === host2WithoutW3;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    addTrailingForwardSlash,
    hasSameOrigin,
    getURLObject,
};
