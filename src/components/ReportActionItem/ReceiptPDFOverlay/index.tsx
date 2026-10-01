import {Document, Thumbnail} from '@components/PDFThumbnail';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';

import variables from '@styles/variables';

import {retrieveMaxCanvasArea, retrieveMaxCanvasHeight, retrieveMaxCanvasWidth} from '@userActions/CanvasSize';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useCallback, useEffect, useState} from 'react';
import {PDFPreviewer} from 'react-fast-pdf';
import {View} from 'react-native';

import type ReceiptPDFOverlayProps from './types';

const oversamplePercent = `${CONST.RECEIPT.HOVER_ZOOM_SCALE * 100}%`;
const oversampleContainerStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: oversamplePercent,
    height: oversamplePercent,
    transform: `scale(${1 / CONST.RECEIPT.HOVER_ZOOM_SCALE})`,
    transformOrigin: 'top left',
};

// PDFPreviewer pads each page by this much, so the single page uses it too to stay framed like the thumbnail
const PDF_PAGE_BORDER = 9;

const DOCUMENT_OPTIONS = {
    cMapUrl: '/cmaps/',
    cMapPacked: true,
};

type CanvasLimits = {
    maxCanvasWidth?: number;
    maxCanvasHeight?: number;
    maxCanvasArea?: number;
};

/**
 * Lowers the render resolution when the default one would exceed the browser's canvas limits, which otherwise
 * leaves the canvas blank on very tall pages. Mirrors PDFPreviewer's calculation.
 */
function getDevicePixelRatio(width: number, height: number, {maxCanvasWidth, maxCanvasHeight, maxCanvasArea}: CanvasLimits): number | undefined {
    if (!maxCanvasWidth || !maxCanvasHeight || !maxCanvasArea || !width || !height) {
        return undefined;
    }
    const ratio = Math.min(maxCanvasHeight / height, maxCanvasWidth / width, Math.sqrt(maxCanvasArea / (width * height)));
    return ratio > window.devicePixelRatio ? undefined : ratio;
}

type ReceiptPDFPageProps = CanvasLimits & {
    /** 1-indexed page to render */
    pageNumber: number;

    /** Width to render the page at */
    width: number;

    /** Called once the page has been drawn */
    onRenderSuccess?: () => void;
};

function ReceiptPDFPage({pageNumber, width, onRenderSuccess, ...canvasLimits}: ReceiptPDFPageProps) {
    const [aspectRatio, setAspectRatio] = useState<number>();
    const devicePixelRatio = aspectRatio ? getDevicePixelRatio(width, width * aspectRatio, canvasLimits) : undefined;

    return (
        <div style={{position: 'absolute', top: PDF_PAGE_BORDER, left: 0}}>
            <Thumbnail
                pageNumber={pageNumber}
                width={width}
                devicePixelRatio={devicePixelRatio}
                loading={null}
                error={null}
                onLoadSuccess={({originalWidth, originalHeight}) => setAspectRatio(originalHeight / originalWidth)}
                onRenderSuccess={onRenderSuccess}
            />
        </div>
    );
}

function ReceiptPDFOverlay({sourceURL, isAuthTokenRequired = true, onLoadFailure, onLoadSuccess, page}: ReceiptPDFOverlayProps) {
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [maxCanvasArea] = useOnyx(ONYXKEYS.MAX_CANVAS_AREA);
    const [maxCanvasHeight] = useOnyx(ONYXKEYS.MAX_CANVAS_HEIGHT);
    const [maxCanvasWidth] = useOnyx(ONYXKEYS.MAX_CANVAS_WIDTH);
    const [oversampleWidth, setOversampleWidth] = useState(0);
    const isSinglePage = page !== undefined;

    // The page last drawn stays on screen while the next one renders, so the thumbnail underneath never flashes through
    const [renderedPage, setRenderedPage] = useState(page);

    // A ResizeObserver reports the size as soon as it starts observing, unlike onLayout added after mount
    const observeOversampleWidth = useCallback(
        (container: HTMLDivElement | null) => {
            if (!container || !isSinglePage) {
                return undefined;
            }
            const observer = new ResizeObserver(([entry]) => setOversampleWidth(entry.contentRect.width));
            observer.observe(container);
            return () => observer.disconnect();
        },
        [isSinglePage],
    );

    useEffect(() => {
        // Verify the per-browser canvas limits have been calculated, mirroring PDFView.
        if (!maxCanvasArea) {
            retrieveMaxCanvasArea();
        }
        if (!maxCanvasHeight) {
            retrieveMaxCanvasHeight();
        }
        if (!maxCanvasWidth) {
            retrieveMaxCanvasWidth();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on mount; canvas limits are one-time browser measurements that don't change
    }, []);

    const fileURL = isAuthTokenRequired ? addEncryptedAuthTokenToURL(sourceURL, session?.encryptedAuthToken ?? '') : sourceURL;

    // Track which URL failed so hasFailed resets automatically when fileURL changes (e.g. after auth token refresh),
    // mirroring the pattern in ThumbnailImage. No useEffect needed — the comparison runs synchronously during render.
    const [failedURL, setFailedURL] = useState<string | null>(null);
    const hasFailed = failedURL !== null && failedURL === fileURL;

    // If the PDF can't be rendered, fall back to the thumbnail underneath by rendering nothing.
    if (hasFailed) {
        return null;
    }

    const handleLoadError = () => {
        setFailedURL(fileURL);
        onLoadFailure?.();
    };

    // Matches PDFPreviewer's page width on small screens: the full width of the oversized container plus its border
    const pageWidth = oversampleWidth + PDF_PAGE_BORDER * 2;
    const canvasLimits = {maxCanvasWidth, maxCanvasHeight, maxCanvasArea};

    return (
        <View
            style={[styles.w100, styles.h100, styles.overflowHidden]}
            pointerEvents="none"
        >
            {/* <div> is required here because `transformOrigin` is a CSS-only property unsupported by React Native's
                View. The oversample-then-scale technique relies on it to anchor the downscale to the top-left corner. */}
            <div
                ref={observeOversampleWidth}
                style={oversampleContainerStyle}
            >
                {page === undefined ? (
                    <PDFPreviewer
                        file={fileURL}
                        pageMaxWidth={variables.pdfPageMaxWidth}
                        // Fit the page to the full width of the (oversized) container, matching the thumbnail framing.
                        isSmallScreen
                        maxCanvasWidth={maxCanvasWidth}
                        maxCanvasHeight={maxCanvasHeight}
                        maxCanvasArea={maxCanvasArea}
                        containerStyle={styles.bgTransparent}
                        contentContainerStyle={styles.bgTransparent}
                        shouldShowErrorComponent={false}
                        LoadingComponent={null}
                        onLoadError={handleLoadError}
                    />
                ) : (
                    // Only the visible page is loaded. PDFPreviewer measures every page before showing any, which takes
                    // tens of seconds on long PDFs and isn't needed when one page is shown at a time.
                    oversampleWidth > 0 && (
                        <Document
                            file={fileURL}
                            options={DOCUMENT_OPTIONS}
                            loading={null}
                            error={null}
                            onLoadSuccess={onLoadSuccess}
                            onLoadError={handleLoadError}
                        >
                            {renderedPage !== undefined && (
                                <ReceiptPDFPage
                                    key={renderedPage}
                                    pageNumber={renderedPage}
                                    width={pageWidth}
                                    {...canvasLimits}
                                />
                            )}
                            {page !== renderedPage && (
                                <ReceiptPDFPage
                                    key={page}
                                    pageNumber={page}
                                    width={pageWidth}
                                    onRenderSuccess={() => setRenderedPage(page)}
                                    {...canvasLimits}
                                />
                            )}
                        </Document>
                    )
                )}
            </div>
        </View>
    );
}

export default ReceiptPDFOverlay;
