import React from 'react';
import type {ImageStyle, StyleProp} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import EReceiptThumbnail from './EReceiptThumbnail';
import Image from './Image';
import ThumbnailImage from './ThumbnailImage';

type ReceiptImageProps = {
    transactionID?: string;
    isThumbnail?: boolean;
    shouldUseThumnailImage?: boolean;
    isEReceipt?: boolean;
    source?: string;
    isAuthTokenRequired?: boolean;
    style?: StyleProp<ImageStyle>;
};

function ReceiptImage({transactionID, isThumbnail = false, shouldUseThumnailImage = false, isEReceipt = false, source, isAuthTokenRequired, style}: ReceiptImageProps) {
    const styles = useThemeStyles();

    if (isEReceipt || isThumbnail) {
        return (
            <View style={[styles.w100, styles.h100]}>
                <EReceiptThumbnail transactionID={transactionID ?? ''} />
            </View>
        );
    }

    if (shouldUseThumnailImage) {
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
