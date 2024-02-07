import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import EReceiptThumbnail from './EReceiptThumbnail';
import Image from './Image';
import ThumbnailImage from './ThumbnailImage';

type Style = {height: number; borderRadius: number; margin: number};

type ReceiptImageProps = (
    | {
          /** Transaction ID of the transaction the receipt belongs to */
          transactionID: string;

          /** Whether it is EReceipt */
          isEReceipt: boolean;

          /** Whether it is receipt preview thumbnail we are displaying */
          isThumbnail?: boolean;

          /** Url of the receipt image */
          source?: string;
      }
    | {
          transactionID: string;
          isEReceipt?: boolean;
          isThumbnail: boolean;
          source?: string;
      }
    | {
          transactionID?: string;
          isEReceipt?: boolean;
          isThumbnail?: boolean;
          source: string;
      }
) & {
    /** Whether we should display the receipt with ThumbnailImage component */
    shouldUseThumbnailImage?: boolean;

    /** Whether the receipt image requires an authToken */
    isAuthTokenRequired?: boolean;

    /** Any additional styles to apply */
    style?: Style;

    /** The file extension of the receipt file */
    fileExtension?: string;
};

function ReceiptImage({transactionID, isThumbnail = false, shouldUseThumbnailImage = false, isEReceipt = false, source, isAuthTokenRequired, style, fileExtension}: ReceiptImageProps) {
    const styles = useThemeStyles();

    if (isEReceipt || isThumbnail) {
        const props = !isEReceipt && {borderRadius: style?.borderRadius, fileExtension, isReceiptThumbnail: true};
        return (
            <View style={style ?? [styles.w100, styles.h100]}>
                <EReceiptThumbnail
                    transactionID={transactionID ?? ''}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
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
