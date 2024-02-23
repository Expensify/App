import type {AVPlaybackStatusSuccess} from 'expo-av';

/**
 * Whether to replay the video when users press play button
 */
export default function shouldReplayVideo(e: AVPlaybackStatusSuccess, isPlaying: boolean, duration: number, position: number): boolean {
    if (!isPlaying && e.isPlaying && duration === position) {
        return true;
    }
    return false;
}
