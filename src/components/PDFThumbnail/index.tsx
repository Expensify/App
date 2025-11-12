import 'core-js/proposals/promise-with-resolvers';
import React, {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import ensurePdfJsInitialized from './pdfSetup';
import PDFThumbnailError from './PDFThumbnailError';
import type PDFThumbnailProps from './types';

const Document = React.lazy(() => import(/* webpackPreload: true */ 'react-pdf').then((m) => ({default: m.Document})));

const Thumbnail = React.lazy(() => import(/* webpackPreload: true */ 'react-pdf').then((m) => ({default: m.Thumbnail})));

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false, enabled = true, onPassword, onLoadError, onLoadSuccess}: PDFThumbnailProps) {
    const styles = useThemeStyles();
    const [failedToLoad, setFailedToLoad] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        ensurePdfJsInitialized().then(() => {
            setReady(true);
        });
    }, []);

    const loadingIndicator = useMemo(() => <FullScreenLoadingIndicator />, []);

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

    const handleError = useCallback(() => null, []);

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
                    error={handleError}
                >
                    <View pointerEvents="none">
                        <Suspense fallback={null}>
                            <Thumbnail pageIndex={0} />
                        </Suspense>
                    </View>
                </Document>
            </Suspense>
        ),
        [loadingIndicator, isAuthTokenRequired, previewSourceURL, onPassword, handleOnLoad, handleOnLoadSuccess, handleOnLoadError, handleError],
    );

    if (!ready) {
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

PDFThumbnail.displayName = 'PDFThumbnail';
export default React.memo(PDFThumbnail);
