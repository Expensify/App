import type {Video} from 'expo-av';
import type {MutableRefObject} from 'react';
import type {View} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import type CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type PlaybackContext = {
    updateCurrentlyPlayingURL: (url: string) => void;
    currentlyPlayingURL: string | null;
    originalParent: View | null;
    sharedElement: View | null;
    currentVideoPlayerRef: MutableRefObject<Video | null>;
    shareVideoPlayerElements: (ref: Video, parent: View, child: View, isUploading: boolean) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    checkVideoPlaying: (statusCallback: (isPlaying: boolean) => void) => void;
};

type VolumeContext = {
    updateVolume: (newVolume: number) => void;
    volume: SharedValue<number>;
};

type SingularMenuItem = {
    icon: IconAsset | null;
    text: string;
    onSelected: () => void;
    shouldPutLeftPaddingWhenNoIcon?: boolean;
};

type MenuItem = {
    icon: IconAsset;
    text: string;
    subMenuItems: SingularMenuItem[];
};

type VideoPopoverMenuContext = {
    menuItems: Array<SingularMenuItem | MenuItem>;
    updatePlaybackSpeed: (speed: PlaybackSpeed) => void;
};

type StatusCallback = (isPlaying: boolean) => void;

type PlaybackSpeed = (typeof CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS)[number];

export type {PlaybackContext, VolumeContext, VideoPopoverMenuContext, MenuItem, SingularMenuItem, StatusCallback, PlaybackSpeed};
