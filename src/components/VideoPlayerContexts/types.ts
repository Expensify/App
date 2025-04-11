import type {MutableRefObject} from 'react';
import type {SharedValue} from 'react-native-reanimated';
import type {TupleToUnion} from 'type-fest';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import type CONST from '@src/CONST';
import type {ResponsiveLayoutProperties} from './FullScreenContext';

type VolumeContext = {
    updateVolume: (newVolume: number) => void;
    volume: SharedValue<number>;
    lastNonZeroVolume: SharedValue<number>;
    toggleMute: () => void;
};

type VideoPopoverMenuContext = {
    menuItems: PopoverMenuItem[];
    videoPopoverMenuPlayerRef: MutableRefObject<VideoWithOnFullScreenUpdate | null>;
    currentPlaybackSpeed: PlaybackSpeed;
    updatePlaybackSpeed: (speed: PlaybackSpeed) => void;
    setCurrentPlaybackSpeed: (speed: PlaybackSpeed) => void;
    setSource: (source: string) => void;
};

type FullScreenContext = {
    isFullScreenRef: MutableRefObject<boolean>;
    lockedWindowDimensionsRef: MutableRefObject<ResponsiveLayoutProperties | null>;
    lockWindowDimensions: (newResponsiveLayoutResult: ResponsiveLayoutProperties) => void;
    unlockWindowDimensions: () => void;
};

type PlaybackSpeed = TupleToUnion<typeof CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS>;

export type {VolumeContext, VideoPopoverMenuContext, FullScreenContext, PlaybackSpeed};
