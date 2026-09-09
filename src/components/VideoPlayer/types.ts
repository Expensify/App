import type CONST from '@src/CONST';

import type {SourceLoadEventPayload} from 'expo-video';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

type VideoPlayerProps = {
    /**
     * Video source used to initialize the player.
     */
    url: string;

    /**
     * Callback fired when the sourceLoad event is triggered.
     * @param event Data containing information about the video source that finished loading.
     */
    onSourceLoaded?: (event: SourceLoadEventPayload) => void;

    /**
     * Whether the video should automatically replay after it ends.
     */
    isLooping?: boolean;

    /**
     * Style applied to the entire VideoPlayer component.
     */
    style?: StyleProp<ViewStyle>;

    videoPlayerStyle?: StyleProp<ViewStyle>;

    /**
     * Style applied to the video player controls.
     */
    videoControlsStyle?: StyleProp<ViewStyle>;

    /**
     * Duration of the video resource, in milliseconds.
     */
    videoDuration?: number;

    shouldUseSharedVideoElement?: boolean;

    /**
     * Whether the video controls should be displayed in a compact layout.
     */
    shouldUseSmallVideoControls?: boolean;

    isVideoHovered?: boolean;

    /**
     * Whether the videoControlsStyle should include additional bottom margin.
     */
    shouldUseControlsBottomMargin?: boolean;

    controlsStatus?: ValueOf<typeof CONST.VIDEO_PLAYER.CONTROLS_STATUS>;

    /**
     * Whether the video should play automatically after loading.
     */
    shouldPlay?: boolean;

    /**
     * Whether the VideoPlayer is displayed inside a message preview.
     */
    isPreview?: boolean;

    /**
     * Report ID of the video resource.
     */
    reportID?: string;
    onTap?: (shouldShowArrows?: boolean) => void;
};

export default VideoPlayerProps;
