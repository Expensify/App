import type {AVPlaybackStatus} from 'expo-av/build/AV';
import type {VideoFullscreenUpdateEvent, VideoReadyForDisplayEvent} from 'expo-av/build/Video.types';
import type {StyleProp, ViewStyle} from 'react-native';

type VideoPlayerProps = {
    url: string;
    onVideoLoaded: (e: VideoReadyForDisplayEvent) => void; //??
    resizeMode: string;
    isLooping: boolean;
    // style for the whole video player component
    style: StyleProp<ViewStyle>;
    // style for the video player inside the component
    videoPlayerStyle: StyleProp<ViewStyle>;
    // style for the video element inside the video player
    videoStyle: StyleProp<ViewStyle>;
    videoControlsStyle: StyleProp<ViewStyle>;
    videoDuration: number;
    shouldUseSharedVideoElement: boolean;
    shouldUseSmallVideoControls: boolean;
    shouldShowVideoControls: boolean;
    isVideoHovered: boolean;
    onFullscreenUpdate: (e: VideoFullscreenUpdateEvent) => void; //??
    onPlaybackStatusUpdate: (e: AVPlaybackStatus) => void; //??
};

export default VideoPlayerProps;
