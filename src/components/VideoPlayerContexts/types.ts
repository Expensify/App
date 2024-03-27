import type {MutableRefObject} from 'react';
import type {View} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import type CONST from '@src/CONST';

type PlaybackContext = {
    updateCurrentlyPlayingURL: (url: string | null) => void;
    currentlyPlayingURL: string | null;
    originalParent: View | HTMLDivElement | null;
    sharedElement: View | HTMLDivElement | null;
    currentVideoPlayerRef: MutableRefObject<VideoWithOnFullScreenUpdate | null>;
    shareVideoPlayerElements: (ref: VideoWithOnFullScreenUpdate | null, parent: View | HTMLDivElement | null, child: View | HTMLDivElement | null, isUploading: boolean) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    checkVideoPlaying: (statusCallback: StatusCallback) => void;
};

type VolumeContext = {
    updateVolume: (newVolume: number) => void;
    volume: SharedValue<number>;
};

type VideoPopoverMenuContext = {
    menuItems: PopoverMenuItem[];
    updatePlaybackSpeed: (speed: PlaybackSpeed) => void;
};

type StatusCallback = (isPlaying: boolean) => void;

type PlaybackSpeed = (typeof CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS)[number];

export type {PlaybackContext, VolumeContext, VideoPopoverMenuContext, StatusCallback, PlaybackSpeed};
