import {URL_WEBSITE_REGEX} from 'expensify-common/lib/Url';

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
    const urlRegex = new RegExp(URL_WEBSITE_REGEX, 'gi');
    const match = urlRegex.exec(href);
    if (!match) {
        return {
            href: undefined,
            protocol: undefined,
            hostname: undefined,
            path: undefined,
        };
    }
    const baseUrl = match[0];
    const protocol = match[1];
    return {
        href,
        protocol,
        hostname: baseUrl.replace(protocol, ''),
        path: href.startsWith(baseUrl) ? href.replace(baseUrl, '') : '',
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
