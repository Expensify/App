import type {VideoPlayer, VideoPlayerStatus, VideoView} from 'expo-video';
import type {RefObject} from 'react';
import type {View} from 'react-native';

/**
 * Callback type for reporting the current playback status.
 * @param isPlaying Whether the video is currently playing.
 */
type StatusCallback = (isPlaying: boolean) => void;

/**
 * Function type for stopping video playback.
 */
type StopVideo = () => void;

/**
 * Represents the original parent container of the video element.
 * Can be a React Native View, an HTML div, or null if not set.
 */
type OriginalParent = View | HTMLDivElement | null;

/**
 * Metadata describing a video element instance.
 */
type VideoElementData = {
    /**
     * Whether the video player should use a shared video element.
     */
    shouldUseSharedVideoElement: boolean;

    /**
     * The video source URL.
     */
    url: string;

    /**
     * The report ID associated with the video, if available.
     */
    reportID: string | undefined;
};

/**
 * Playback-related context values available throughout the app.
 */
type PlaybackContextValues = {
    /**
     * Updates the currently tracked video URL and associated report ID.
     * @param url The new video URL.
     * @param reportID The new report ID.
     */
    updateCurrentURLAndReportID: (url: string | undefined, reportID: string | undefined) => void;

    /**
     * The URL of the video currently being played, or null if none.
     */
    currentlyPlayingURL: string | null;

    /**
     * The report ID associated with the current navigation route.
     */
    currentRouteReportID: string | undefined;

    /**
     * The original parent container of the shared video element.
     */
    originalParent: View | HTMLDivElement | null;

    /**
     * The shared video element container, if one exists.
     */
    sharedElement: View | HTMLDivElement | null;

    /**
     * Updates shared video player elements across different parts of the UI.
     * @param playerRef Reference to the VideoPlayer instance.
     * @param viewRef Reference to the VideoView instance.
     * @param parent Parent container for the shared video element.
     * @param child Child container for the shared video element.
     * @param isUploading Whether the video is currently uploading.
     * @param videoElementData Metadata describing the video element.
     */
    shareVideoPlayerElements: (
        playerRef: VideoPlayer | null,
        viewRef: VideoView | null,
        parent: View | HTMLDivElement | null,
        child: View | HTMLDivElement | null,
        isUploading: boolean,
        videoElementData: VideoElementData,
    ) => void;

    /**
     * Sets the URL of the currently playing video.
     */
    setCurrentlyPlayingURL: React.Dispatch<React.SetStateAction<string | null>>;

    /**
     * Array of currently mounted Video Player instances
     */
    mountedVideoPlayersRef: RefObject<string[]>;

    /**
     * Status of the currently used Video Player
     */
    playerStatus: RefObject<VideoPlayerStatus>;

    /**
     * Updates current videoPlayer status
     * @param newStatus New videoPlayer status
     */
    updatePlayerStatus: (newStatus: VideoPlayerStatus) => void;
};

/**
 * References and helper methods for managing video playback.
 */
type PlaybackContextVideoRefs = {
    /**
     * Resets the player data in the context.
     */
    resetPlayerData: () => void;

    /**
     * Starts video playback.
     */
    play: () => void;

    /**
     * Pauses video playback.
     */
    pause: () => void;

    /**
     * Restarts video playback from the beginning.
     */
    replay: () => void;

    /**
     * Stops video playback and resets progress.
     */
    stop: () => void;

    /**
     * Checks whether the video is currently playing.
     * @param statusCallback Callback receiving the playback status.
     */
    isPlaying: (statusCallback: StatusCallback) => void;

    /**
     * Reference to the current VideoPlayer instance.
     */
    playerRef: RefObject<VideoPlayer | null>;

    /**
     * Reference to the current VideoView instance.
     */
    viewRef: RefObject<VideoView | null>;

    /**
     * Updates the current player and view references.
     * @param playerRef Reference to the VideoPlayer.
     * @param viewRef Reference to the VideoView.
     */
    updateRefs: (playerRef: VideoPlayer | null, viewRef: VideoView | null) => void;
};

/**
 * Combined playback context with values and video control helpers.
 */
type PlaybackContext = PlaybackContextValues & {
    resetVideoPlayerData: PlaybackContextVideoRefs['resetPlayerData'];
    playVideo: PlaybackContextVideoRefs['play'];
    pauseVideo: PlaybackContextVideoRefs['pause'];
    replayVideo: PlaybackContextVideoRefs['replay'];
    stopVideo: PlaybackContextVideoRefs['stop'];
    checkIfVideoIsPlaying: PlaybackContextVideoRefs['isPlaying'];
    currentVideoPlayerRef: PlaybackContextVideoRefs['playerRef'];
    currentVideoViewRef: PlaybackContextVideoRefs['viewRef'];
};

export type {PlaybackContextVideoRefs, StopVideo, PlaybackContextValues, PlaybackContext, OriginalParent};
