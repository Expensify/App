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
    let match;
    try {
        if (!href.startsWith('mailto:')) {
            match = urlRegex.exec(href);
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Error parsing url in Url.getURLObject', {error: e});
    }
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
 * Determine if we should remove w3 from hostname
 * E.g www.expensify.com should be the same as expensify.com
 * @param {String} hostname
 * @returns {Boolean}
 */
function shouldRemoveW3FromExpensifyUrl(hostname) {
    // Since expensify.com.dev is accessible with and without www subdomain
    if (hostname === 'www.expensify.com.dev') {
        return true;
    }
    const parts = hostname.split('.').reverse();
    const subDomain = parts[2];
    return subDomain === 'www';
}

/**
 * Determine if two urls have the same origin
 * Just care about expensify url to avoid the second-level domain (www.example.co.uk)
 * @param {String} url1
 * @param {String} url2
 * @returns {Boolean}
 */
function hasSameExpensifyOrigin(url1, url2) {
    const host1 = getURLObject(url1).hostname;
    const host2 = getURLObject(url2).hostname;
    if (!host1 || !host2) {
        return false;
    }
    const host1WithoutW3 = shouldRemoveW3FromExpensifyUrl(host1) ? host1.replace('www.', '') : host1;
    const host2WithoutW3 = shouldRemoveW3FromExpensifyUrl(host2) ? host2.replace('www.', '') : host2;
    return host1WithoutW3 === host2WithoutW3;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    addTrailingForwardSlash,
    hasSameExpensifyOrigin,
    getURLObject,
};
