import type {ViewStyle} from 'react-native';

type GetImageCompactModeStyle = (maxWidth: number, availableWidth: number, aspectRatio?: number | null, imageHeight?: number | null) => ViewStyle;

export default GetImageCompactModeStyle;
