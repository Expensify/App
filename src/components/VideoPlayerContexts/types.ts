import type {MutableRefObject} from 'react';
import type {View} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import type {TupleToUnion} from 'type-fest';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import type CONST from '@src/CONST';
import type {ResponsiveLayoutProperties} from './FullScreenContext';

type PlaybackContext = {
    updateCurrentlyPlayingURL: (url: string | null) => void;
    currentlyPlayingURL: string | null;
    currentlyPlayingURLReportID: string | undefined;
    originalParent: View | HTMLDivElement | null;
    sharedElement: View | HTMLDivElement | null;
    videoResumeTryNumberRef: MutableRefObject<number>;
    currentVideoPlayerRef: MutableRefObject<VideoWithOnFullScreenUpdate | null>;
    shareVideoPlayerElements: (ref: VideoWithOnFullScreenUpdate | null, parent: View | HTMLDivElement | null, child: View | HTMLDivElement | null, isUploading: boolean) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    checkVideoPlaying: (statusCallback: StatusCallback) => void;
    setCurrentlyPlayingURL: React.Dispatch<React.SetStateAction<string | null>>;
};

type VolumeContext = {
    updateVolume: (newVolume: number) => void;
    volume: SharedValue<number>;
};

type VideoPopoverMenuContext = {
    menuItems: PopoverMenuItem[];
    videoPopoverMenuPlayerRef: MutableRefObject<VideoWithOnFullScreenUpdate | null>;
    currentPlaybackSpeed: PlaybackSpeed;
    updatePlaybackSpeed: (speed: PlaybackSpeed) => void;
    setCurrentPlaybackSpeed: (speed: PlaybackSpeed) => void;
};

type FullScreenContext = {
    isFullScreenRef: MutableRefObject<boolean>;
    lockedWindowDimensionsRef: MutableRefObject<ResponsiveLayoutProperties | null>;
    lockWindowDimensions: (newResponsiveLayoutResult: ResponsiveLayoutProperties) => void;
    unlockWindowDimensions: () => void;
};

type StatusCallback = (isPlaying: boolean) => void;

type PlaybackSpeed = TupleToUnion<typeof CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS>;

export type {PlaybackContext, VolumeContext, VideoPopoverMenuContext, FullScreenContext, StatusCallback, PlaybackSpeed};
