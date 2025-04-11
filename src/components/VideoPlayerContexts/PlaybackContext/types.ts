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

type PlaybackContext = {
    updateCurrentlyPlayingURL: (url: string | undefined, reportID: string | undefined) => void;
    currentlyPlayingURL: string | null;
    currentRouteReportID: string | undefined;
    originalParent: View | HTMLDivElement | null;
    sharedElement: View | HTMLDivElement | null;
    videoResumeTryNumberRef: MutableRefObject<number>;
    currentVideoPlayerRef: MutableRefObject<VideoWithOnFullScreenUpdate | null>;
    shareVideoPlayerElements: (
        ref: VideoWithOnFullScreenUpdate | null,
        parent: View | HTMLDivElement | null,
        child: View | HTMLDivElement | null,
        isUploading: boolean,
        videoElementData: VideoElementData,
    ) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    checkVideoPlaying: (statusCallback: StatusCallback) => void;
    setCurrentlyPlayingURL: React.Dispatch<React.SetStateAction<string | null>>;
    resetVideoPlayerData: () => void;
};

export type {StatusCallback, PlaybackContext, OriginalParent, UnloadVideo, StopVideo, PlayVideoPromiseRef};
