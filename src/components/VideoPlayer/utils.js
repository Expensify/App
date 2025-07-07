"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMillisecondsToTime = convertMillisecondsToTime;
exports.addSkipTimeTagToURL = addSkipTimeTagToURL;
var Browser = require("@libs/Browser");
/**
 * Converts milliseconds to '[hours:]minutes:seconds' format
 */
function convertMillisecondsToTime(milliseconds) {
    var hours = Math.floor(milliseconds / 3600000);
    var minutes = Math.floor((milliseconds / 60000) % 60);
    var seconds = Math.floor((milliseconds / 1000) % 60)
        .toFixed(0)
        .padStart(2, '0');
    return hours > 0 ? "".concat(hours, ":").concat(String(minutes).padStart(2, '0'), ":").concat(seconds) : "".concat(minutes, ":").concat(seconds);
}
/**
 * Adds a #t=seconds tag to the end of the URL to skip first seconds of the video
 */
function addSkipTimeTagToURL(url, seconds) {
    // On iOS: mWeb (WebKit-based browser engines), we don't add the time fragment
    // because it's not supported and will throw (WebKitBlobResource error 1).
    if (Browser.isMobileWebKit() || url.includes('#t=')) {
        return url;
    }
    return "".concat(url, "#t=").concat(seconds);
}
