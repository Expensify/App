type LocalPDFReceiptPreviewProps = {
    /** Local URL of the PDF file to preview */
    sourceURL: string;

    /** Whether the preview should fill the full available height of its container */
    shouldUseFullHeight?: boolean;

    /** Called when the PDF fails to load */
    onLoadFailure?: () => void;

    /** Called when the PDF loads successfully */
    onLoadSuccess?: () => void;
};

export default LocalPDFReceiptPreviewProps;
