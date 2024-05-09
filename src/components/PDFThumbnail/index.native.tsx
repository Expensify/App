import React, {useState} from 'react';
import {View} from 'react-native';
import Pdf from 'react-native-pdf';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import variables from '@styles/variables';
import type PDFThumbnailProps from './types';

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false, enabled = true, onPassword, onLoadError}: PDFThumbnailProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const sizeStyles = [styles.w100, styles.h100];
    const [hasError, setHasError] = useState(false);

    return (
        <View style={[style, styles.overflowHidden]}>
            <View style={[sizeStyles, !hasError && styles.alignItemsCenter, styles.justifyContentCenter]}>
                {enabled && !hasError && (
                    <Pdf
                        fitPolicy={0}
                        trustAllCerts={false}
                        renderActivityIndicator={() => <FullScreenLoadingIndicator />}
                        source={{uri: isAuthTokenRequired ? addEncryptedAuthTokenToURL(previewSourceURL) : previewSourceURL}}
                        singlePage
                        style={sizeStyles}
                        onError={(error) => {
                            if (onLoadError) {
                                onLoadError();
                            }
                            if ('message' in error && typeof error.message === 'string' && error.message.match(/password/i) && onPassword) {
                                onPassword();
                                return;
                            }
                            setHasError(true);
                        }}
                    />
                )}
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
