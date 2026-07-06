import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';

import variables from '@styles/variables';

import {retrieveMaxCanvasArea, retrieveMaxCanvasHeight, retrieveMaxCanvasWidth} from '@userActions/CanvasSize';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useState} from 'react';
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

function ReceiptPDFOverlay({sourceURL, isAuthTokenRequired = true, onLoadFailure}: ReceiptPDFOverlayProps) {
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [maxCanvasArea] = useOnyx(ONYXKEYS.MAX_CANVAS_AREA);
    const [maxCanvasHeight] = useOnyx(ONYXKEYS.MAX_CANVAS_HEIGHT);
    const [maxCanvasWidth] = useOnyx(ONYXKEYS.MAX_CANVAS_WIDTH);

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

    return (
        <View
            style={[styles.w100, styles.h100, styles.overflowHidden]}
            pointerEvents="none"
        >
            {/* <div> is required here because `transformOrigin` is a CSS-only property unsupported by React Native's
                View. The oversample-then-scale technique relies on it to anchor the downscale to the top-left corner. */}
            <div style={oversampleContainerStyle}>
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
                    onLoadError={() => {
                        setFailedURL(fileURL);
                        onLoadFailure?.();
                    }}
                />
            </div>
        </View>
    );
}

export default ReceiptPDFOverlay;
