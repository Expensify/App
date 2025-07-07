"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = shouldReplayVideo;
/**
 * Whether to replay the video when users press play button
 */
function shouldReplayVideo(e, isPlaying, duration, position) {
    if (!isPlaying && e.isPlaying && duration === position) {
        return true;
    }
    return false;
}
