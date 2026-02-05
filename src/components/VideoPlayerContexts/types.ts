import type {VideoPlayer} from 'expo-video';
import type {RefObject} from 'react';
import type {SharedValue} from 'react-native-reanimated';
import type {TupleToUnion} from 'type-fest';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type CONST from '@src/CONST';
import type {ResponsiveLayoutProperties} from './FullScreenContext';

type VolumeContext = {
    /**
     * Updates the current volume.
     * @param newVolume The new volume value to set.
     */
    updateVolume: (newVolume: number) => void;

    /**
     * The current volume value.
     */
    volume: SharedValue<number>;

    /**
     * The last non-zero volume value before mute.
     * This value is restored after unmuting.
     */
    lastNonZeroVolume: SharedValue<number>;

    /**
     * Toggles the mute state.
     */
    toggleMute: () => void;
};

type VideoPopoverMenuContext = {
    /**
     * The items displayed in the video popover menu.
     */
    menuItems: PopoverMenuItem[];

    /**
     * Updates the video player reference used by the popover menu.
     * @param ref The video player ref.
     */
    updateVideoPopoverMenuPlayerRef: (videoPlayer: VideoPlayer | null) => void;

    /**
     * Updates the playback speed inside VideoPopoverMenuContext.
     * @param speed The new playback speed value.
     */
    updatePlaybackSpeed: (speed: PlaybackSpeed) => void;

    /**
     * Updates the video source URL inside VideoPopoverMenuContext.
     * @param source The new source URL.
     */
    updateSource: (source: string) => void;
};

type FullScreenContext = {
    /**
     * Whether the application is currently in fullscreen mode.
     */
    isFullScreenRef: RefObject<boolean>;

    /**
     * Window dimensions saved before entering fullscreen mode.
     * Used to preserve UI state without triggering excessive re-renders.
     */
    lockedWindowDimensionsRef: RefObject<ResponsiveLayoutProperties | null>;

    /**
     * Sets the locked window dimensions.
     * @param newResponsiveLayoutResult The window dimensions to lock.
     */
    lockWindowDimensions: (newResponsiveLayoutResult: ResponsiveLayoutProperties) => void;

    /**
     * Clears the locked window dimensions.
     */
    unlockWindowDimensions: () => void;
};

type PlaybackSpeed = TupleToUnion<typeof CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS>;

export type {VolumeContext, VideoPopoverMenuContext, FullScreenContext, PlaybackSpeed};
