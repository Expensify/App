import React, {lazy, Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import Log from '@libs/Log';
import type PDFThumbnailProps from './types';

const PDFThumbnailImpl = lazy(() => import('./PDFThumbnailImpl'));

function PDFThumbnail(props: PDFThumbnailProps) {
    const styles = useThemeStyles();

    const logError = (error: Error) => {
        Log.alert(`Error loading PDFThumbnail - ${error.message}`, {}, false);
    };

    return (
        <ErrorBoundary
            fallback={<View />}
            onError={logError}
        >
            <Suspense
                fallback={
                    <View style={[props.style, styles.overflowHidden]}>
                        <FullScreenLoadingIndicator />
                    </View>
                }
            >
                <PDFThumbnailImpl
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            </Suspense>
        </ErrorBoundary>
    );
}

export default PDFThumbnail;
