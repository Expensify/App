/**
 * Whether to replay the video when users press play button
 *
 * @param {Object} e // playback status event
 * @param {Boolean} isPlaying
 * @param {Number} duration
 * @param {Number} position
 * @returns {Boolean}
 */
export default function shouldReplayVideo(e, isPlaying, duration, position) {
    if (!isPlaying && e.isPlaying && duration === position) {
        return true;
    }
    return false;
}
