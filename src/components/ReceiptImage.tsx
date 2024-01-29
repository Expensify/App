import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import EReceiptThumbnail from './EReceiptThumbnail';
import Image from './Image';
import ThumbnailImage from './ThumbnailImage';

type Style = {height: number; borderRadius: number; margin: number};

type ReceiptImageProps = {
    transactionID?: string;
    isThumbnail?: boolean;
    shouldUseThumbnailImage?: boolean;
    isEReceipt?: boolean;
    source?: string;
    isAuthTokenRequired?: boolean;
    style?: Style;
    fileExtension?: string;
};

function ReceiptImage({transactionID, isThumbnail = false, shouldUseThumbnailImage = false, isEReceipt = false, source, isAuthTokenRequired, style, fileExtension}: ReceiptImageProps) {
    const styles = useThemeStyles();

    if (isEReceipt || isThumbnail) {
        return (
            <View style={style ?? [styles.w100, styles.h100]}>
                <EReceiptThumbnail
                    transactionID={transactionID ?? ''}
                    borderRadius={style?.borderRadius}
                    fileExtension={fileExtension}
                    isThumbnail
                    useStaticIconLayout
                />
            </View>
        );
    }

    if (shouldUseThumbnailImage) {
        return (
            <ThumbnailImage
                previewSourceURL={source ?? ''}
                style={[styles.w100, styles.h100]}
                isAuthTokenRequired
                shouldDynamicallyResize={false}
            />
        );
    }

    return (
        <Image
            source={{uri: source}}
            style={style ?? [styles.w100, styles.h100]}
            isAuthTokenRequired={isAuthTokenRequired}
        />
    );
}

export type {ReceiptImageProps};
export default ReceiptImage;
