import 'react-native-url-polyfill/auto';
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
 * Get path from URL string
 * @param {String} url
 * @returns {String}
 */
function getPathFromURL(url) {
    try {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
        return path.substring(1); // Remove the leading '/'
    } catch (error) {
        console.error('Error parsing URL:', error);
        return ''; // Return empty string for invalid URLs
    }
}

/**
 * Determine if two urls have the same origin
 * @param {String} url1
 * @param {String} url2
 * @returns {Boolean}
 */
function hasSameExpensifyOrigin(url1, url2) {
    const removeW3 = (host) => host.replace(/^www\./i, '');
    try {
        const parsedUrl1 = new URL(url1);
        const parsedUrl2 = new URL(url2);

        return removeW3(parsedUrl1.host) === removeW3(parsedUrl2.host);
    } catch (error) {
        // Handle invalid URLs or other parsing errors
        console.error('Error parsing URLs:', error);
        return false;
    }
}

export {
    // eslint-disable-next-line import/prefer-default-export
    addTrailingForwardSlash,
    hasSameExpensifyOrigin,
    getPathFromURL,
};
