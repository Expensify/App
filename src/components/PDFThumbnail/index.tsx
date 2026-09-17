import LoadingIndicator from '@components/LoadingIndicator';

import useThemeStyles from '@hooks/useThemeStyles';

import type {PDFDocumentProxy} from 'pdfjs-dist';

// eslint-disable-next-line import/extensions
import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {Document, pdfjs, Thumbnail} from 'react-pdf';

import type PDFThumbnailProps from './types';

import PDFThumbnailError from './PDFThumbnailError';

pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));

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

// Re-exported so other PDF-rendering components reuse this file's worker setup
// instead of importing pdfjs-dist/react-pdf directly.
export {Document, Thumbnail};
export type {PDFDocumentProxy};
