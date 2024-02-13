import React from 'react';
import {View} from 'react-native';
import Pdf from 'react-native-pdf';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import type PDFThumbnailProps from './types';

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false}: PDFThumbnailProps) {
    const styles = useThemeStyles();
    const sizeStyles = [styles.w100, styles.h100];

    return (
        <View style={[style, styles.overflowHidden]}>
            <View style={[sizeStyles, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <Pdf
                    fitPolicy={0}
                    trustAllCerts={false}
                    renderActivityIndicator={() => <FullScreenLoadingIndicator />}
                    source={{uri: isAuthTokenRequired ? addEncryptedAuthTokenToURL(previewSourceURL) : previewSourceURL.toString()}}
                    singlePage
                    style={sizeStyles}
                />
            </View>
        </View>
    );
}

PDFThumbnail.displayName = 'PDFThumbnail';
export default React.memo(PDFThumbnail);
