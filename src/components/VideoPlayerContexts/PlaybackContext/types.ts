import type {AVPlaybackStatus} from 'expo-av';
import type {MutableRefObject} from 'react';
import type {View} from 'react-native';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';

type StatusCallback = (isPlaying: boolean) => void;
type OriginalParent = View | HTMLDivElement | null;
type UnloadVideo = () => void;
type StopVideo = () => void;
type PlayVideoPromiseRef = MutableRefObject<Promise<AVPlaybackStatus> | undefined>;

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
        ref: VideoWithOnFullScreenUpdate | null,
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
    resumeTryNumberRef: MutableRefObject<number>;
    ref: MutableRefObject<VideoWithOnFullScreenUpdate | null>;
    updateRef: (ref: VideoWithOnFullScreenUpdate | null) => void;
};

type PlaybackContext = PlaybackContextValues & {
    resetVideoPlayerData: PlaybackContextVideoRefs['resetPlayerData'];
    playVideo: PlaybackContextVideoRefs['play'];
    pauseVideo: PlaybackContextVideoRefs['pause'];
    checkIfVideoIsPlaying: PlaybackContextVideoRefs['isPlaying'];
    videoResumeTryNumberRef: PlaybackContextVideoRefs['resumeTryNumberRef'];
    currentVideoPlayerRef: PlaybackContextVideoRefs['ref'];
};

export type {StatusCallback, PlaybackContextValues, OriginalParent, UnloadVideo, StopVideo, PlayVideoPromiseRef, PlaybackContextVideoRefs, PlaybackContext};
