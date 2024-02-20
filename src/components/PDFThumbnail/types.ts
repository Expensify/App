import type {StyleProp, ViewStyle} from 'react-native';

type PDFThumbnailProps = {
    /** Source URL for the preview PDF */
    previewSourceURL: string;

    /** Any additional styles to apply */
    style?: StyleProp<ViewStyle>;

    /** Whether the image requires an authToken */
    isAuthTokenRequired?: boolean;

    /** Whether need to skip loading password protected PDF */
    shouldLoadPDFThumbnail?: boolean;

    /** Callback to call if PDF is password protected */
    onPasswordCallback?: () => void;
};

export default PDFThumbnailProps;
