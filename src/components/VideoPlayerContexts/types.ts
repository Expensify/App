import type {Video} from 'expo-av';
import type {MutableRefObject} from 'react';
import type {View} from 'react-native';

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

export default PlaybackContext;
