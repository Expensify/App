import LoadingIndicator from '@components/LoadingIndicator';

import useThemeStyles from '@hooks/useThemeStyles';

import '@libs/pdfWorker';

import type {PDFDocumentProxy} from 'pdfjs-dist';

import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {Document, Thumbnail} from 'react-pdf';

import type PDFThumbnailProps from './types';

import PDFThumbnailError from './PDFThumbnailError';

function PDFThumbnail({previewSourceURL, style, enabled = true, onPassword, onLoadError, onLoadSuccess}: PDFThumbnailProps) {
    const styles = useThemeStyles();
    const [failedToLoad, setFailedToLoad] = useState(false);

    const thumbnail = useMemo(
        () => (
            <Document
                loading={<LoadingIndicator />}
                file={previewSourceURL}
                options={{
                    // Use a root-relative URL so the CMap files (needed to render non-Latin fonts)
                    // resolve against the server root instead of the current deep route.
                    cMapUrl: '/cmaps/',
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
        [previewSourceURL, onPassword, onLoadError, onLoadSuccess],
    );

    return (
        <View style={[style, styles.overflowHidden, failedToLoad && styles.h100]}>
            <View
                style={[
                    styles.w100,
                    styles.h100,
                    !failedToLoad && {
                        ...styles.alignItemsCenter,
                        ...styles.justifyContentCenter,
                    },
                ]}
            >
                {enabled && !failedToLoad && thumbnail}
                {failedToLoad && <PDFThumbnailError />}
            </View>
        </View>
    );
}

PDFThumbnail.displayName = 'PDFThumbnail';

export default React.memo(PDFThumbnail);

// Re-exported so other PDF-rendering components pick up the @libs/pdfWorker setup this file
// imports, instead of importing pdfjs-dist/react-pdf directly.
export {Document, Thumbnail};
export type {PDFDocumentProxy};
