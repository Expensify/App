import Str from 'expensify-common/lib/str';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {Transaction} from '@src/types/onyx';
import EReceiptThumbnail from './EReceiptThumbnail';
import Image from './Image';
import ThumbnailImage from './ThumbnailImage';

type ReceiptImageProps = {
    transaction?: Transaction;
    receiptPath?: string;
    receiptFileName?: string;
    style?: StyleProp<ViewStyle>;
    isAuthTokenRequired?: boolean;
    confirmationPage?: boolean;
};

function ReceiptImage({transaction, receiptPath, receiptFileName, style, isAuthTokenRequired, confirmationPage}: ReceiptImageProps) {
    const styles = useThemeStyles();
    // URI to image, i.e. blob:new.expensify.com/9ef3a018-4067-47c6-b29f-5f1bd35f213d or expensify.com/receipts/w_e616108497ef940b7210ec6beb5a462d01a878f4.jpg
    const path = transaction?.receipt?.source ?? receiptPath ?? '';
    // filename of uploaded image or last part of remote URI
    const filename = transaction?.filename ?? receiptFileName ?? '';
    const isReceiptImage = Str.isImage(filename);
    const shouldDisplayThumbnail = Object.hasOwn(transaction?.pendingFields ?? {}, 'waypoints') || !isReceiptImage;
    const image = !shouldDisplayThumbnail && !(path.startsWith('blob:') || path.startsWith('file:')) ? `${path}.1024.jpg` : path;
    const isLocalFile = typeof path === 'number' || path.startsWith('blob:') || path.startsWith('file:') || path.startsWith('/');

    const imageSource = tryResolveUrlFromApiRoot(image ?? '');

    const isEReceipt = transaction && TransactionUtils.hasEReceipt(transaction);

    if (!transaction) {
        return (
            <Image
                source={{uri: receiptFileName ?? receiptPath}}
                style={style ?? [styles.w100, styles.h100]}
                isAuthTokenRequired={isAuthTokenRequired}
            />
        );
    }

    if (!!isEReceipt || shouldDisplayThumbnail) {
        if (!(!isLocalFile && !Str.isPDF(imageSource))) {
            return (
                <View style={style ?? [styles.w100, styles.h100]}>
                    <EReceiptThumbnail transactionID={transaction?.transactionID ?? ''} />
                </View>
            );
        }

        return (
            <ThumbnailImage
                previewSourceURL={imageSource}
                style={[styles.w100, styles.h100]}
                isAuthTokenRequired
                shouldDynamicallyResize={false}
            />
        );
    }

    return isReceiptImage && !confirmationPage ? (
        <ThumbnailImage
            previewSourceURL={imageSource}
            style={[styles.w100, styles.h100]}
            isAuthTokenRequired
            shouldDynamicallyResize={false}
        />
    ) : (
        <Image
            source={{uri: isLocalFile ? path : imageSource}}
            style={style ?? [styles.w100, styles.h100]}
            isAuthTokenRequired={isAuthTokenRequired}
        />
    );
}

export default ReceiptImage;
