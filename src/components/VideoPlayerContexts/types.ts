import type {VideoPlayer} from 'expo-video';
import type {SharedValue} from 'react-native-reanimated';
import type {TupleToUnion} from 'type-fest';
import type CONST from '@src/CONST';

type VolumeStateContextType = {
    /**
     * The current volume value.
     */
    volume: SharedValue<number>;

    /**
     * The last non-zero volume value before mute.
     * This value is restored after unmuting.
     */
    lastNonZeroVolume: SharedValue<number>;
};

type VolumeActionsContextType = {
    /**
     * Updates the current volume.
     * @param newVolume The new volume value to set.
     */
    updateVolume: (newVolume: number) => void;

    /**
     * Toggles the mute state.
     */
    toggleMute: () => void;
};

type VideoPopoverMenuStateContextType = {
    /** Currently-selected playback speed (drives the radio indicator in the speeds submenu). */
    currentPlaybackSpeed: PlaybackSpeed;

    /** True when the source is a local URI; the download row is hidden. */
    isLocalFile: boolean;
};

type VideoPopoverMenuActionsContextType = {
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

    /** Triggers the download flow for the current source. */
    downloadAttachment: () => void;
};

type PlaybackSpeed = TupleToUnion<typeof CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS>;

export type {VolumeStateContextType, VolumeActionsContextType, VideoPopoverMenuStateContextType, VideoPopoverMenuActionsContextType, PlaybackSpeed};
