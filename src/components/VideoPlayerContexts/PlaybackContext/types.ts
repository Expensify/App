import type {VideoPlayer, VideoView} from 'expo-video';
import type {RefObject} from 'react';
import type {View} from 'react-native';

type StatusCallback = (isPlaying: boolean) => void;
type StopVideo = () => void;
type OriginalParent = View | HTMLDivElement | null;

type VideoElementData = {
    shouldUseSharedVideoElement: boolean;
    url: string;
    reportID: string | undefined;
};

type PlaybackContextValues = {
    updateCurrentURLAndReportID: (url: string | undefined, reportID: string | undefined) => void;
    currentlyPlayingURL: string | null;
    currentRouteReportID: string | undefined;
    originalParent: View | HTMLDivElement | null;
    sharedElement: View | HTMLDivElement | null;
    shareVideoPlayerElements: (
        playerRef: VideoPlayer | null,
        viewRef: VideoView | null,
        parent: View | HTMLDivElement | null,
        child: View | HTMLDivElement | null,
        isUploading: boolean,
        videoElementData: VideoElementData,
    ) => void;
    setCurrentlyPlayingURL: React.Dispatch<React.SetStateAction<string | null>>;
};

type PlaybackContextVideoRefs = {
    resetPlayerData: () => void;
    play: () => void;
    pause: () => void;
    isPlaying: (statusCallback: StatusCallback) => void;
    playerRef: RefObject<VideoPlayer | null>;
    viewRef: RefObject<VideoView | null>;
    updateRefs: (playerRef: VideoPlayer | null, viewRef: VideoView | null) => void;
};

type PlaybackContext = PlaybackContextValues & {
    resetVideoPlayerData: PlaybackContextVideoRefs['resetPlayerData'];
    playVideo: PlaybackContextVideoRefs['play'];
    pauseVideo: PlaybackContextVideoRefs['pause'];
    checkIfVideoIsPlaying: PlaybackContextVideoRefs['isPlaying'];
    currentVideoPlayerRef: PlaybackContextVideoRefs['playerRef'];
    currentVideoViewRef: PlaybackContextVideoRefs['viewRef'];
};

export type {PlaybackContextVideoRefs, StopVideo, PlaybackContextValues, PlaybackContext, OriginalParent};
