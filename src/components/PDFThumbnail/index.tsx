// @ts-expect-error - This line imports a module from 'pdfjs-dist' package which lacks TypeScript typings.
import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {Document, pdfjs, Thumbnail} from 'react-pdf';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import variables from '@styles/variables';
import type PDFThumbnailProps from './types';

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));
}

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false, enabled = true, onPassword, onLoadError}: PDFThumbnailProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const [hasError, setHasError] = useState(false);

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
                onLoad={() => {
                    setHasError(false);
                }}
                onLoadError={() => {
                    if (onLoadError) {
                        onLoadError();
                    }
                    setHasError(true);
                }}
                error={() => null}
            >
                <View pointerEvents="none">
                    <Thumbnail pageIndex={0} />
                </View>
            </Document>
        ),
        [isAuthTokenRequired, previewSourceURL, onPassword, onLoadError],
    );

    return (
        <View style={[style, styles.h100, styles.overflowHidden]}>
            <View style={[styles.w100, styles.h100, !hasError && styles.alignItemsCenter, !hasError && styles.justifyContentCenter]}>
                {enabled && thumbnail}
                {hasError && (
                    <View style={[styles.justifyContentCenter, styles.pdfErrorPlaceholder, styles.alignItemsCenter]}>
                        <Icon
                            src={Expensicons.ReceiptSlash}
                            width={variables.receiptPlaceholderIconWidth}
                            height={variables.receiptPlaceholderIconHeight}
                            fill={theme.icon}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

PDFThumbnail.displayName = 'PDFThumbnail';
export default React.memo(PDFThumbnail);
