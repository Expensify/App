import PDFThumbnail from '@components/PDFThumbnail';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type LocalPDFReceiptPreviewProps from './types';

// `shouldUseFullHeight` only affects the web zoom-mode container sizing; on native the non-zoom PDFThumbnail is used.
function LocalPDFReceiptPreview({sourceURL, onLoadFailure, onLoadSuccess}: LocalPDFReceiptPreviewProps) {
    const styles = useThemeStyles();
    return (
        <PDFThumbnail
            previewSourceURL={sourceURL}
            style={[styles.w100, styles.h100]}
            onLoadError={onLoadFailure}
            onLoadSuccess={onLoadSuccess}
        />
    );
}

export default LocalPDFReceiptPreview;
