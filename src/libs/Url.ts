import 'react-native-url-polyfill/auto';

function addTrailingForwardSlash(url:string):string {
    if (!url.endsWith('/')) {
        return `${url}/`;
    }
    return url;
}


function getPathFromURL(url:string): string {
    try {
        const parsedUrl: URL = new URL(url);
        const path: string = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
        return path.substring(1); // Remove the leading '/'
    } catch (error) {
        console.error('Error parsing URL:', error);
        return ''; // Return empty string for invalid URLs
    }
}

/**
 * Determine if two urls have the same origin
 */
function hasSameExpensifyOrigin(url1: string, url2: string): boolean {
    const removeW3 = (host: string): string => host.replace(/^www\./i, '');
    try {
        const parsedUrl1: URL = new URL(url1);
        const parsedUrl2: URL = new URL(url2);

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
