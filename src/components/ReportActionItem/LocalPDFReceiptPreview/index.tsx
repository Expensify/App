import React from 'react';
import PDFThumbnail from '@components/PDFThumbnail';
import CONST from '@src/CONST';
import type LocalPDFReceiptPreviewProps from './types';

function LocalPDFReceiptPreview({sourceURL, shouldUseFullHeight, onLoadFailure, onLoadSuccess}: LocalPDFReceiptPreviewProps) {
    return (
        <PDFThumbnail
            previewSourceURL={sourceURL}
            zoomScale={CONST.RECEIPT.HOVER_ZOOM_SCALE}
            shouldUseFullHeight={shouldUseFullHeight}
            onLoadError={onLoadFailure}
            onLoadSuccess={onLoadSuccess}
        />
    );
}

export default LocalPDFReceiptPreview;
