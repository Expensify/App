"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchParamFromUrl = getSearchParamFromUrl;
exports.addTrailingForwardSlash = addTrailingForwardSlash;
exports.hasSameExpensifyOrigin = hasSameExpensifyOrigin;
exports.getPathFromURL = getPathFromURL;
exports.appendParam = appendParam;
exports.hasURL = hasURL;
exports.addLeadingForwardSlash = addLeadingForwardSlash;
exports.extractUrlDomain = extractUrlDomain;
require("react-native-url-polyfill/auto");
var CONST_1 = require("@src/CONST");
/**
 * Add / to the end of any URL if not present
 */
function addTrailingForwardSlash(url) {
    if (!url.endsWith('/')) {
        return "".concat(url, "/");
    }
    return url;
}
function addLeadingForwardSlash(url) {
    if (!url.startsWith('/')) {
        return "/".concat(url);
    }
    return url;
}
/**
 * Get path from URL string
 */
function getPathFromURL(url) {
    try {
        var parsedUrl = new URL(url);
        var path = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
        return path.substring(1); // Remove the leading '/'
    }
    catch (error) {
        console.error('Error parsing URL:', error);
        return ''; // Return empty string for invalid URLs
    }
}
/**
 * Determine if two urls have the same origin
 */
function hasSameExpensifyOrigin(url1, url2) {
    var removeW3 = function (host) { return host.replace(/^www\./i, ''); };
    try {
        var parsedUrl1 = new URL(url1);
        var parsedUrl2 = new URL(url2);
        return removeW3(parsedUrl1.host) === removeW3(parsedUrl2.host);
    }
    catch (error) {
        // Handle invalid URLs or other parsing errors
        console.error('Error parsing URLs:', error);
        return false;
    }
}
/**
 * Appends or updates a query parameter in a given URL.
 */
function appendParam(url, paramName, paramValue) {
    // If parameter exists, replace it
    if (url.includes("".concat(paramName, "="))) {
        var regex = new RegExp("".concat(paramName, "=([^&]*)"));
        return url.replace(regex, "".concat(paramName, "=").concat(paramValue));
    }
    // If parameter doesn't exist, append it
    var separator = url.includes('?') ? '&' : '?';
    return "".concat(url).concat(separator).concat(paramName, "=").concat(paramValue);
}
function hasURL(text) {
    var urlPattern = /((https|http)?:\/\/[^\s]+)/g;
    return urlPattern.test(text);
}
function extractUrlDomain(url) {
    var match = String(url).match(CONST_1.default.REGEX.DOMAIN_BASE);
    return match === null || match === void 0 ? void 0 : match[1];
}
function getSearchParamFromUrl(currentUrl, param) {
    return currentUrl ? new URL(currentUrl).searchParams.get(param) : null;
}
