import type {VideoReadyForDisplayEvent} from 'expo-av';
import type {StyleProp, ViewStyle} from 'react-native';

type VideoPlayerProps = {
    url: string;
    onVideoLoaded: (event?: VideoReadyForDisplayEvent) => void | undefined;
    resizeMode: string;
    isLooping: boolean;
    // style for the whole video player component
    style: StyleProp<ViewStyle>;
    // style for the video player inside the component
    videoPlayerStyle: StyleProp<ViewStyle>;
    // style for the video element inside the video player
    videoStyle: StyleProp<ViewStyle>;
    videoControlsStyle: ViewStyle;
    videoDuration: number;
    shouldUseSharedVideoElement: boolean;
    shouldUseSmallVideoControls: boolean;
    shouldShowVideoControls: boolean;
    isVideoHovered: boolean;
    onFullscreenUpdate: PropTypes.func;
    onPlaybackStatusUpdate: PropTypes.func;
};

export default VideoPlayerProps;
