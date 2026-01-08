import type {AVPlaybackStatusSuccess} from 'expo-av';

/**
 * Whether to replay the video when users press play button
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function shouldReplayVideo(e: AVPlaybackStatusSuccess, isPlaying: boolean, duration: number, position: number): boolean {
    return false;
}
