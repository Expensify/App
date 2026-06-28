import type {StyleProp, ViewStyle} from 'react-native';

type PDFThumbnailProps = {
    /** Source URL for the preview PDF */
    previewSourceURL: string;

    /** Any additional styles to apply */
    style?: StyleProp<ViewStyle>;

    /** Whether the PDF thumbnail can be loaded */
    enabled?: boolean;

    /** Fit policy for the PDF thumbnail */
    fitPolicy?: 0 | 1 | 2;

    /**
     * When set (web only), render the thumbnail in "oversample" mode for a sharp hover-zoom: the page is
     * drawn at `zoomScale`× the display size and CSS-scaled back to 1×, and the container adopts the page's
     * natural aspect ratio. Ignored on native.
     */
    zoomScale?: number;

    /**
     * When set (web zoom mode), the thumbnail container fills the full available height while the PDF's natural
     * aspect ratio is still unknown (loading or load failure) instead of collapsing inside an auto-height parent.
     */
    shouldUseFullHeight?: boolean;

    /** Callback to call if PDF is password protected */
    onPassword?: () => void;

    /** Callback to call if PDF can't be loaded(corrupted) */
    onLoadError?: () => void;

    /** Callback to call if PDF is loaded */
    onLoadSuccess?: () => void;
};

export default PDFThumbnailProps;
