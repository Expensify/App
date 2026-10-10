type ReceiptPDFOverlayProps = {
    /** Resolved URL of the source PDF. The encrypted auth token is appended internally when required. */
    sourceURL: string;

    /** Whether the source requires an encrypted auth token */
    isAuthTokenRequired?: boolean;

    /** Called when the PDF fails to load so the caller can fall back to the thumbnail */
    onLoadFailure?: () => void;

    /** Called once the PDF has loaded and its pages can be shown. Only fires when `page` is set. */
    onLoadSuccess?: () => void;

    /** 1-indexed page to show at the top of the overlay */
    page?: number;
};

export default ReceiptPDFOverlayProps;
