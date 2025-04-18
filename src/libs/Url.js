"use strict";
exports.__esModule = true;
exports.extractUrlDomain = exports.addLeadingForwardSlash = exports.hasURL = exports.appendParam = exports.getPathFromURL = exports.hasSameExpensifyOrigin = exports.addTrailingForwardSlash = exports.getSearchParamFromUrl = void 0;
require("react-native-url-polyfill/auto");
var CONST_1 = require("@src/CONST");
/**
 * Add / to the end of any URL if not present
 */
function addTrailingForwardSlash(url) {
    if (!url.endsWith('/')) {
        return url + "/";
    }
    return url;
}
exports.addTrailingForwardSlash = addTrailingForwardSlash;
function addLeadingForwardSlash(url) {
    if (!url.startsWith('/')) {
        return "/" + url;
    }
    return url;
}
exports.addLeadingForwardSlash = addLeadingForwardSlash;
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
exports.getPathFromURL = getPathFromURL;
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
exports.hasSameExpensifyOrigin = hasSameExpensifyOrigin;
/**
 * Appends or updates a query parameter in a given URL.
 */
function appendParam(url, paramName, paramValue) {
    // If parameter exists, replace it
    if (url.includes(paramName + "=")) {
        var regex = new RegExp(paramName + "=([^&]*)");
        return url.replace(regex, paramName + "=" + paramValue);
    }
    // If parameter doesn't exist, append it
    var separator = url.includes('?') ? '&' : '?';
    return "" + url + separator + paramName + "=" + paramValue;
}
exports.appendParam = appendParam;
function hasURL(text) {
    var urlPattern = /((https|http)?:\/\/[^\s]+)/g;
    return urlPattern.test(text);
}
exports.hasURL = hasURL;
function extractUrlDomain(url) {
    var match = String(url).match(CONST_1["default"].REGEX.DOMAIN_BASE);
    return match === null || match === void 0 ? void 0 : match[1];
}
exports.extractUrlDomain = extractUrlDomain;
function getSearchParamFromUrl(currentUrl, param) {
    return currentUrl ? new URL(currentUrl).searchParams.get(param) : null;
}
exports.getSearchParamFromUrl = getSearchParamFromUrl;
