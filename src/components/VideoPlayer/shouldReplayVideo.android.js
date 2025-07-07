"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = shouldReplayVideo;
/**
 * Whether to replay the video when users press play button
 */
function shouldReplayVideo(e, isPlaying, duration, position) {
    // When we upload an attachment on Android, didJustFinish is false and the duration is 0
    // so we should return false if the duration is 0 to prevent auto-playing video when the video is uploading
    if (!isPlaying && !e.didJustFinish && duration === position && duration !== 0) {
        return true;
    }
    return false;
}
