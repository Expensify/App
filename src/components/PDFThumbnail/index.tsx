// eslint-disable-next-line import/extensions
import pdfWorkerSource from 'pdfjs-dist/build/pdf.worker.min.mjs?raw';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {Document, pdfjs, Thumbnail} from 'react-pdf';
import LoadingIndicator from '@components/LoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import '@src/polyfills/Map';
import mapPolyfillsSource from '@src/polyfills/Map?raw';
import '@src/polyfills/ReadableStream';
import PDFThumbnailError from './PDFThumbnailError';
import type PDFThumbnailProps from './types';

// The worker is imported as a string using ?raw + Blob otherwise it will default to loading via an HTTPS request.
// This causes issues if we have gone offline before the pdfjs web worker is set up, as we won't be able to load it from the server.
pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([`${mapPolyfillsSource}\n${pdfWorkerSource}`], {type: 'text/javascript'}));

function PDFThumbnail({previewSourceURL, style, enabled = true, onPassword, onLoadError, onLoadSuccess}: PDFThumbnailProps) {
    const styles = useThemeStyles();
    const [failedToLoad, setFailedToLoad] = useState(false);

    const thumbnail = useMemo(
        () => (
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
        [previewSourceURL, onPassword, onLoadError, onLoadSuccess],
    );

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
