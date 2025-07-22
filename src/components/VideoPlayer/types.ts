import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type VideoPlayerProps = {
    url: string;
    resizeMode?: string;
    isLooping?: boolean;
    // style for the whole video player component
    style?: StyleProp<ViewStyle>;
    // style for the video player inside the component
    videoPlayerStyle?: StyleProp<ViewStyle>;
    // style for the video element inside the video player
    videoStyle?: StyleProp<ViewStyle>;
    videoControlsStyle?: StyleProp<ViewStyle>;
    videoDuration?: number;
    shouldUseSharedVideoElement?: boolean;
    shouldUseSmallVideoControls?: boolean;
    shouldShowVideoControls?: boolean;
    isVideoHovered?: boolean;
    shouldUseControlsBottomMargin?: boolean;
    controlsStatus?: ValueOf<typeof CONST.VIDEO_PLAYER.CONTROLS_STATUS>;
    shouldPlay?: boolean;
    isPreview?: boolean;
    reportID?: string;
};

export default VideoPlayerProps;
