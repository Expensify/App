import type {GestureResponderEvent} from 'react-native';

type VideoPlayerThumbnailProps = {
    thumbnailUrl: string | undefined;
    onPress: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;
    accessibilityLabel: string;
};

type VideoPlayerPreviewProps = {
    videoUrl: string;

    videoDimensions: {
        width: number;
        height: number;
    };

    videoDuration: number;

    thumbnailUrl?: string;

    fileName: string;

    onShowModalPress: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;
};

export type {VideoPlayerThumbnailProps, VideoPlayerPreviewProps};
