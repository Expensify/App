import React, {useState} from 'react';
import {View} from 'react-native';
import Pdf from 'react-native-pdf';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import type PDFThumbnailProps from './types';

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false, enabled = true, onPassword, errorLabelStyles}: PDFThumbnailProps) {
    const styles = useThemeStyles();
    const sizeStyles = [styles.w100, styles.h100];
    const {translate} = useLocalize();

    const [isCorrupted, setIsCorrupted] = useState(false);

    return (
        <View style={[style, styles.overflowHidden]}>
            <View style={[sizeStyles, styles.alignItemsCenter, styles.justifyContentCenter]}>
                {enabled && !isCorrupted && (
                    <Pdf
                        fitPolicy={0}
                        trustAllCerts={false}
                        renderActivityIndicator={() => <FullScreenLoadingIndicator />}
                        source={{uri: isAuthTokenRequired ? addEncryptedAuthTokenToURL(previewSourceURL) : previewSourceURL}}
                        singlePage
                        style={sizeStyles}
                        onError={(error) => {
                            if ('message' in error && typeof error.message === 'string' && error.message.match(/corrupted/i)) {
                                setIsCorrupted(true);
                            }

                            if (!('message' in error && typeof error.message === 'string' && error.message.match(/password/i))) {
                                return;
                            }

                            if (!onPassword) {
                                return;
                            }
                            onPassword();
                        }}
                    />
                )}
                {isCorrupted && <Text style={[styles.textLabel, errorLabelStyles]}>{translate('attachmentView.failedToLoadPDF')}</Text>}
            </View>
        </View>
    );
}

PDFThumbnail.displayName = 'PDFThumbnail';
export default React.memo(PDFThumbnail);
