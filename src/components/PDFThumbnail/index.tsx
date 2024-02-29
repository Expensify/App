// @ts-expect-error - We use the same method as PDFView to import the worker
import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {Document, pdfjs, Thumbnail} from 'react-pdf';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import './index.css';
import type PDFThumbnailProps from './types';

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false, enabled = true, onPassword = () => {}, isClickable = true}: PDFThumbnailProps) {
    const styles = useThemeStyles();

    useEffect(() => {
        const workerURL = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));
        if (pdfjs.GlobalWorkerOptions.workerSrc !== workerURL) {
            pdfjs.GlobalWorkerOptions.workerSrc = workerURL;
        }
    }, []);

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
                    onPassword();
                }}
            >
                <Thumbnail
                    pageIndex={0}
                    className={isClickable ? '' : 'react-pdf__Thumbnail--notClickable'}
                />
            </Document>
        ),
        [isAuthTokenRequired, previewSourceURL, onPassword, isClickable],
    );

    return (
        <View style={[style, styles.overflowHidden]}>
            <View style={[styles.w100, styles.h100, styles.alignItemsCenter, styles.justifyContentCenter]}>{enabled && thumbnail}</View>
        </View>
    );
}

PDFThumbnail.displayName = 'PDFThumbnail';
export default React.memo(PDFThumbnail);
