/**
 * Converts milliseconds to '[hours:]minutes:seconds' format
 */
function convertMillisecondsToTime(milliseconds: number) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds / 60000) % 60);
    const seconds = Math.floor((milliseconds / 1000) % 60)
        .toFixed(0)
        .padStart(2, '0');
    return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
}

/**
 * Adds a #t=seconds tag to the end of the URL to skip first seconds of the video
 */
function addSkipTimeTagToURL(url: string, seconds: number) {
    if (url.includes('#t=')) {
        return url;
    }
    return `${url}#t=${seconds}`;
}

export {convertMillisecondsToTime, addSkipTimeTagToURL};
