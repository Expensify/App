import LoadingIndicator from '@components/LoadingIndicator';
import {Document, Thumbnail} from '@components/PDFThumbnail';
import type {PDFDocumentProxy} from '@components/PDFThumbnail';
import PDFThumbnailError from '@components/PDFThumbnail/PDFThumbnailError';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

import type LocalPDFReceiptPreviewProps from './types';

// Must be a stable reference: react-pdf's <Document> reloads the PDF whenever this object changes identity,
// so a new literal on every render would tear down and restart the load in a loop.
const DOCUMENT_OPTIONS = {cMapUrl: '/cmaps/', cMapPacked: true};

function LocalPDFReceiptPreview({sourceURL, shouldUseFullHeight, onLoadFailure, onLoadSuccess}: LocalPDFReceiptPreviewProps) {
    const styles = useThemeStyles();
    const [failedToLoad, setFailedToLoad] = useState(false);
    const [containerSize, setContainerSize] = useState<{width: number; height: number} | undefined>(undefined);
    const [pageAspectRatio, setPageAspectRatio] = useState<number | undefined>(undefined);

    const handleDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
        pdf.getPage(1)
            .then((page) => {
                const viewport = page.getViewport({scale: 1});
                if (viewport.width > 0 && viewport.height > 0) {
                    setPageAspectRatio(viewport.width / viewport.height);
                }
                onLoadSuccess?.();
            })
            .catch(() => onLoadSuccess?.());
    };

    const handleDocumentLoadError = () => {
        setFailedToLoad(true);
        onLoadFailure?.();
    };

    // Render at zoom-scale × display size, CSS-scale back to 1× so the canvas is already at zoom
    // resolution and stays sharp when ReceiptHoverZoom applies its scale.
    const oversampleStyle = (() => {
        if (!containerSize || pageAspectRatio === undefined) {
            return undefined;
        }
        const displayWidth = containerSize.width;
        const tw = displayWidth * CONST.RECEIPT.HOVER_ZOOM_SCALE;
        const th = (displayWidth / pageAspectRatio) * CONST.RECEIPT.HOVER_ZOOM_SCALE;
        return {
            divStyle: {
                position: 'absolute' as const,
                top: 0,
                left: 0,
                width: tw,
                height: th,
                transform: `scale(${1 / CONST.RECEIPT.HOVER_ZOOM_SCALE})`,
                transformOrigin: 'top left',
            },
            thumbnailWidth: tw,
        };
    })();

    const isReady = containerSize !== undefined && oversampleStyle !== undefined;

    // Before the PDF aspect ratio is known, fill the parent so the loading indicator / error placeholder is
    // centred. In a full-height context the parent is auto-height (flexibleHeight), so h100 would collapse to its
    // minHeight — fall back to a 1:1 box so the placeholder fills the panel instead. Once the ratio is known,
    // switch to the PDF's natural aspect ratio so the WideRHP container can expand to the full page height, while
    // fixed-height contexts (e.g. 16:9 expenseViewImage) simply clip the excess.
    const fallbackHeightStyle = shouldUseFullHeight ? {aspectRatio: 1} : styles.h100;
    const heightStyle = pageAspectRatio !== undefined ? {aspectRatio: pageAspectRatio} : fallbackHeightStyle;

    return (
        <View
            style={[styles.w100, heightStyle, styles.overflowHidden]}
            onLayout={(e) => {
                const {width, height} = e.nativeEvent.layout;
                setContainerSize((prev) => (prev?.width === width && prev?.height === height ? prev : {width, height}));
            }}
        >
            {!isReady && !failedToLoad && <LoadingIndicator />}
            {failedToLoad ? (
                <PDFThumbnailError style={shouldUseFullHeight ? styles.pdfErrorPlaceholderFullWidth : undefined} />
            ) : (
                <Document
                    loading={null}
                    file={sourceURL}
                    options={DOCUMENT_OPTIONS}
                    externalLinkTarget="_blank"
                    onLoadSuccess={handleDocumentLoadSuccess}
                    onLoadError={handleDocumentLoadError}
                    error={() => null}
                >
                    {isReady && (
                        <div style={oversampleStyle.divStyle}>
                            <View pointerEvents="none">
                                <Thumbnail
                                    pageIndex={0}
                                    width={oversampleStyle.thumbnailWidth}
                                />
                            </View>
                        </div>
                    )}
                </Document>
            )}
        </View>
    );
}

export default LocalPDFReceiptPreview;
