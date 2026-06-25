import type {PDFDocumentProxy} from 'pdfjs-dist';
// eslint-disable-next-line import/extensions
import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {Document, pdfjs, Thumbnail} from 'react-pdf';
import LoadingIndicator from '@components/LoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import PDFThumbnailError from './PDFThumbnailError';
import type PDFThumbnailProps from './types';

pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));

function PDFThumbnail({previewSourceURL, style, enabled = true, zoomScale, shouldUseFullHeight, onPassword, onLoadError, onLoadSuccess}: PDFThumbnailProps) {
    const styles = useThemeStyles();
    const [failedToLoad, setFailedToLoad] = useState(false);

    // Oversample-mode state (only used when `zoomScale` is set).
    const [containerSize, setContainerSize] = useState<{width: number; height: number} | undefined>(undefined);
    const [pageAspectRatio, setPageAspectRatio] = useState<number | undefined>(undefined);

    const thumbnail = useMemo(
        () =>
            zoomScale ? null : (
                <Document
                    loading={<LoadingIndicator />}
                    file={previewSourceURL}
                    options={{
                        cMapUrl: 'cmaps/',
                        cMapPacked: true,
                    }}
                    externalLinkTarget="_blank"
                    onPassword={onPassword}
                    onLoad={() => {
                        setFailedToLoad(false);
                    }}
                    onLoadSuccess={() => {
                        if (!onLoadSuccess) {
                            return;
                        }
                        onLoadSuccess();
                    }}
                    onLoadError={() => {
                        if (onLoadError) {
                            onLoadError();
                        }
                        setFailedToLoad(true);
                    }}
                    error={() => null}
                >
                    <View pointerEvents="none">
                        <Thumbnail pageIndex={0} />
                    </View>
                </Document>
            ),
        [zoomScale, previewSourceURL, onPassword, onLoadError, onLoadSuccess],
    );

    const handleDocumentLoadSuccess = useCallback(
        (pdf: PDFDocumentProxy) => {
            pdf.getPage(1)
                .then((page) => {
                    const viewport = page.getViewport({scale: 1});
                    if (viewport.width > 0 && viewport.height > 0) {
                        setPageAspectRatio(viewport.width / viewport.height);
                    }
                    onLoadSuccess?.();
                })
                .catch(() => onLoadSuccess?.());
        },
        [onLoadSuccess],
    );

    const handleDocumentLoadError = useCallback(() => {
        setFailedToLoad(true);
        onLoadError?.();
    }, [onLoadError]);

    // Compute the oversample div style and thumbnail width once both container size and page aspect ratio are known.
    // Same oversample technique as ReceiptPDFOverlay: render at zoom-scale × display size, CSS-scale back to 1×
    // so the canvas is already at zoom resolution and stays sharp when ReceiptHoverZoom applies its scale.
    const oversampleStyle = useMemo(() => {
        if (!zoomScale || !containerSize || pageAspectRatio === undefined) {
            return undefined;
        }
        const {width: cW} = containerSize;

        // Fill the container width, same framing as the server-generated thumbnail shown post-scan.
        // Excess height is clipped by the overflow:hidden container.
        const displayWidth = cW;
        const tw = displayWidth * zoomScale;
        const th = (displayWidth / pageAspectRatio) * zoomScale;

        return {
            divStyle: {
                position: 'absolute' as const,
                top: 0,
                left: 0,
                width: tw,
                height: th,
                transform: `scale(${1 / zoomScale})`,
                transformOrigin: 'top left',
            },
            thumbnailWidth: tw,
        };
    }, [zoomScale, containerSize, pageAspectRatio]);

    if (zoomScale) {
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
                style={[styles.w100, heightStyle, styles.overflowHidden, style]}
                onLayout={(e) => {
                    const {width, height} = e.nativeEvent.layout;
                    setContainerSize((prev) => (prev?.width === width && prev?.height === height ? prev : {width, height}));
                }}
            >
                {!isReady && !failedToLoad && <LoadingIndicator />}
                {failedToLoad ? (
                    // In the full-height receipt view the placeholder should span the panel width, overriding its default max width.
                    <PDFThumbnailError style={shouldUseFullHeight ? styles.pdfErrorPlaceholderFullWidth : undefined} />
                ) : (
                    <Document
                        loading={null}
                        file={previewSourceURL}
                        options={{cMapUrl: 'cmaps/', cMapPacked: true}}
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

    return (
        <View style={[style, styles.overflowHidden, failedToLoad && styles.h100]}>
            <View style={[styles.w100, styles.h100, !failedToLoad && {...styles.alignItemsCenter, ...styles.justifyContentCenter}]}>
                {enabled && !failedToLoad && thumbnail}
                {failedToLoad && <PDFThumbnailError />}
            </View>
        </View>
    );
}

PDFThumbnail.displayName = 'PDFThumbnail';

export default React.memo(PDFThumbnail);
