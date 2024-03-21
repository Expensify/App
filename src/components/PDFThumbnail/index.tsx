// @ts-expect-error - This line imports a module from 'pdfjs-dist' package which lacks TypeScript typings.
import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {Document, pdfjs, Thumbnail} from 'react-pdf';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import type PDFThumbnailProps from './types';

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));
}

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false, enabled = true, onPassword}: PDFThumbnailProps) {
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
                onPassword={onPassword}
            >
                <View pointerEvents="none">
                    <Thumbnail pageIndex={0} />
                </View>
            </Document>
        ),
        [isAuthTokenRequired, previewSourceURL, onPassword],
    );

    return (
        <View style={[style, styles.overflowHidden]}>
            <View style={[styles.w100, styles.h100, styles.alignItemsCenter, styles.justifyContentCenter]}>{enabled && thumbnail}</View>
        </View>
    );
}

PDFThumbnail.displayName = 'PDFThumbnail';
export default React.memo(PDFThumbnail);
