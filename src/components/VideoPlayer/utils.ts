import {isMobileWebKit} from '@libs/Browser';

/**
 * Converts seconds to '[hours:]minutes:seconds' format
 */
function convertSecondsToTime(secondsTotal: number) {
    const hours = Math.floor(secondsTotal / 3600);
    const minutes = Math.floor((secondsTotal / 60) % 60);
    const seconds = Math.floor(secondsTotal % 60)
        .toFixed(0)
        .padStart(2, '0');
    return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
}

/**
 * Adds a #t=seconds tag to the end of the URL to skip first seconds of the video
 */
function addSkipTimeTagToURL(url: string, seconds: number) {
    // On iOS: mWeb (WebKit-based browser engines), we don't add the time fragment
    // because it's not supported and will throw (WebKitBlobResource error 1).
    if (isMobileWebKit() || url.includes('#t=')) {
        return url;
    }
    return `${url}#t=${seconds}`;
}

export {convertSecondsToTime, addSkipTimeTagToURL};
