import React, {useMemo} from 'react';
import {View} from 'react-native';
import {Document, pdfjs, Thumbnail} from 'react-pdf';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import type PDFThumbnailProps from './types';

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/legacy/build/pdf.worker.min.js',
        // @ts-expect-error - It is a recommended step for import worker - https://github.com/wojtekmaj/react-pdf/blob/main/packages/react-pdf/README.md#import-worker-recommended
        import.meta.url,
    ).toString();
}

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false, shouldLoadPDFThumbnail = true, onPasswordCallback = () => {}}: PDFThumbnailProps) {
    const styles = useThemeStyles();

    const thumbnail = useMemo(
        () => (
            <Document
                loading={<FullScreenLoadingIndicator />}
                file={isAuthTokenRequired ? addEncryptedAuthTokenToURL(previewSourceURL) : previewSourceURL}
                options={{
                    cMapUrl: 'cmaps/',
                    cMapPacked: true,
                }}
                externalLinkTarget="_blank"
                onPassword={() => {
                    onPasswordCallback();
                }}
            >
                <Thumbnail pageIndex={0} />
            </Document>
        ),
        [isAuthTokenRequired, previewSourceURL, onPasswordCallback],
    );

    return (
        <View style={[style, styles.overflowHidden]}>
            <View style={[styles.w100, styles.h100, styles.alignItemsCenter, styles.justifyContentCenter]}>{shouldLoadPDFThumbnail && thumbnail}</View>
        </View>
    );
}

PDFThumbnail.displayName = 'PDFThumbnail';
export default React.memo(PDFThumbnail);
