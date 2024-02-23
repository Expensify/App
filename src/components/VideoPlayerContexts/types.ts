import type {Video} from 'expo-av';
import type {MutableRefObject} from 'react';
import type {View} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';

type PlaybackContext = {
    updateCurrentlyPlayingURL: (url: string) => void;
    currentlyPlayingURL: string | null;
    originalParent: View | null;
    sharedElement: View | null;
    currentVideoPlayerRef: MutableRefObject<Video | null>;
    shareVideoPlayerElements: (ref: Video, parent: View, child: View) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    checkVideoPlaying: (statusCallback: (isPlaying: boolean) => void) => void;
};

type VolumeContext = {
    updateVolume: (newVolume: number) => void;
    volume: SharedValue<number>;
};

export type {PlaybackContext, VolumeContext};
