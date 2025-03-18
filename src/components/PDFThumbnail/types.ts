import type {StyleProp, ViewStyle} from 'react-native';

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

    /** Callback to call if PDF can't be loaded(corrupted) */
    onLoadError?: () => void;

    /** Callback to call if PDF is loaded */
    onLoadSuccess?: () => void;
};

export default PDFThumbnailProps;
