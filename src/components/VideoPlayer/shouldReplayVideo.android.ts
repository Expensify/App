import type {AVPlaybackStatusSuccess} from 'expo-av';

/**
 * Whether to replay the video when users press play button
 */
export default function shouldReplayVideo(e: AVPlaybackStatusSuccess, isPlaying: boolean, duration: number, position: number): boolean {
    // When we upload an attachment on Android, didJustFinish is false and the duration is 0
    // so we should return false if the duration is 0 to prevent auto-playing video when the video is uploading
    if (!isPlaying && !e.didJustFinish && duration === position && duration !== 0) {
        return true;
    }
    return false;
}
