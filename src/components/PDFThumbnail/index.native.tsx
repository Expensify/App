import React, {useState} from 'react';
import {View} from 'react-native';
import Pdf from 'react-native-pdf';
import LoadingIndicator from '@components/LoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import PDFThumbnailError from './PDFThumbnailError';
import type PDFThumbnailProps from './types';

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false, enabled = true, fitPolicy = 0, onPassword, onLoadError, onLoadSuccess}: PDFThumbnailProps) {
    const styles = useThemeStyles();
    const sizeStyles = [styles.w100, styles.h100];
    const [failedToLoad, setFailedToLoad] = useState(false);

    return (
        <View style={[style, styles.overflowHidden]}>
            <View style={[sizeStyles, !failedToLoad && styles.alignItemsCenter, styles.justifyContentCenter]}>
                {enabled && !failedToLoad && (
                    <Pdf
                        fitPolicy={fitPolicy}
                        trustAllCerts={false}
                        renderActivityIndicator={() => <LoadingIndicator />}
                        source={{uri: isAuthTokenRequired ? addEncryptedAuthTokenToURL(previewSourceURL) : previewSourceURL}}
                        singlePage
                        style={sizeStyles}
                        onError={(error) => {
                            if ('message' in error && typeof error.message === 'string' && error.message.match(/password/i) && onPassword) {
                                onPassword();
                                return;
                            }
                            if (onLoadError) {
                                onLoadError();
                            }
                            setFailedToLoad(true);
                        }}
                        onLoadComplete={() => {
                            if (!onLoadSuccess) {
                                return;
                            }
                            onLoadSuccess();
                        }}
                    />
                )}
                {failedToLoad && <PDFThumbnailError />}
            </View>
        </View>
    );
}

PDFThumbnail.displayName = 'PDFThumbnail';

export default React.memo(PDFThumbnail);
