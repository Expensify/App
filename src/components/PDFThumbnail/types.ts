import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type PDFThumbnailProps = {
    /** Source URL for the preview PDF */
    previewSourceURL: string;

    /** Any additional styles to apply */
    style?: StyleProp<ViewStyle>;

    /** Whether the PDF thumbnail requires an authToken */
    isAuthTokenRequired?: boolean;

    /** Whether the PDF thumbnail can be loaded */
    enabled?: boolean;

    /** Callback to call if PDF is password protected */
    onPassword?: () => void;

    /** Styles for the error label */
    errorLabelStyles?: StyleProp<TextStyle>;
};

export default PDFThumbnailProps;
