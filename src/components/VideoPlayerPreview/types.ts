import type {GestureResponderEvent} from 'react-native';

type VideoPlayerThumbnailProps = {
    thumbnailUrl: string | undefined;
    onPress: (event?: GestureResponderEvent | KeyboardEvent) => void;
    accessibilityLabel: string;
};

export default VideoPlayerThumbnailProps;
