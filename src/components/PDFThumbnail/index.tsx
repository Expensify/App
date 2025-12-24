import 'core-js/proposals/promise-with-resolvers';
import React, {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import {Document, ensurePdfJsInitialized, Thumbnail} from '@components/PDF';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import CONST from '@src/CONST';
import PDFThumbnailError from './PDFThumbnailError';
import type PDFThumbnailProps from './types';

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false, enabled = true, onPassword, onLoadError, onLoadSuccess, onPdfInitFailed}: PDFThumbnailProps) {
    const [failedToLoad, setFailedToLoad] = useState(false);
    const [ready, setReady] = useState(false);
    const [pdfInitializationFailed, setPdfInitializationFailed] = useState(false);

    const styles = useThemeStyles();

    useEffect(() => {
        ensurePdfJsInitialized()
            ?.then(() => {
                setReady(true);
            })
            .catch(() => {
                setPdfInitializationFailed(true);
                onPdfInitFailed?.();
            });
        // We only want to call this method once
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadingIndicator = useMemo(() => <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />, []);

    const handleOnLoad = useCallback(() => {
        setFailedToLoad(false);
    }, []);

    const handleOnLoadSuccess = useCallback(() => {
        if (!onLoadSuccess) {
            return;
        }
        onLoadSuccess();
    }, [onLoadSuccess]);

    const handleOnLoadError = useCallback(() => {
        if (onLoadError) {
            onLoadError();
        }
        setFailedToLoad(true);
    }, [onLoadError]);

    const thumbnail = useMemo(
        () => (
            <Suspense fallback={loadingIndicator}>
                <Document
                    loading={loadingIndicator}
                    file={isAuthTokenRequired ? addEncryptedAuthTokenToURL(previewSourceURL) : previewSourceURL}
                    options={{
                        cMapUrl: 'cmaps/',
                        cMapPacked: true,
                    }}
                    externalLinkTarget="_blank"
                    onPassword={onPassword}
                    onLoad={handleOnLoad}
                    onLoadSuccess={handleOnLoadSuccess}
                    onLoadError={handleOnLoadError}
                    error={() => null}
                >
                    <View pointerEvents="none">
                        <Thumbnail pageIndex={0} />
                    </View>
                </Document>
            </Suspense>
        ),
        [loadingIndicator, isAuthTokenRequired, previewSourceURL, onPassword, handleOnLoad, handleOnLoadSuccess, handleOnLoadError],
    );

    if (!ready || pdfInitializationFailed) {
        return null;
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

export default React.memo(PDFThumbnail);
