import React, {useRef, useState} from 'react';
import type {ImageResizeMode, ImageStyle, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import EReceiptThumbnail from '@components/EReceiptThumbnail';
import type {IconSize} from '@components/EReceiptThumbnail';
import EReceiptWithSizeCalculation from '@components/EReceiptWithSizeCalculation';
import type {FullScreenLoadingIndicatorIconSize} from '@components/FullscreenLoadingIndicator';
import ImageWithLoading from '@components/ImageWithLoading';
import PDFThumbnail from '@components/PDFThumbnail';
import ReceiptEmptyState from '@components/ReceiptEmptyState';
import type {TransactionListItemType} from '@components/SelectionListWithSections/types';
import ThumbnailImage from '@components/ThumbnailImage';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type {ReceiptSource} from '@src/types/onyx/Transaction';
import type IconAsset from '@src/types/utils/IconAsset';
import shouldUseAspectRatioForEReceipts from './shouldUseAspectRatioForEReceipts';

// It is used to avoid updating the image width in a loop.
const MIN_UPDATE_WIDTH_DIFF = 1000;

type ReceiptImageProps = (
    | {
          /** Transaction ID of the transaction the receipt belongs to */
          transactionID: string;

          /** Whether it is EReceipt */
          isEReceipt: boolean;

          /** Whether it is receipt preview thumbnail we are displaying */
          isThumbnail?: boolean;

          /** Url of the receipt image */
          source?: ReceiptSource;

          /** Whether it is a pdf thumbnail we are displaying */
          isPDFThumbnail?: false;
      }
    | {
          transactionID?: string;
          isEReceipt?: boolean;
          isThumbnail: boolean;
          source?: ReceiptSource;
          isPDFThumbnail?: false;
      }
    | {
          transactionID?: string;
          isEReceipt?: boolean;
          isThumbnail?: boolean;
          source: ReceiptSource;
          isPDFThumbnail?: false;
      }
    | {
          transactionID?: string;
          isEReceipt?: boolean;
          isThumbnail?: boolean;
          source: ReceiptSource;
          isPDFThumbnail?: false;
      }
    | {
          transactionID?: string;
          isEReceipt?: boolean;
          isThumbnail?: boolean;
          source?: string;
          isPDFThumbnail: true;
      }
) & {
    /** Whether we should display the receipt with ThumbnailImage component */
    shouldUseThumbnailImage?: boolean;

    /** Whether we should display the receipt with initial object position */
    shouldUseInitialObjectPosition?: boolean;

    /** Whether the receipt image requires an authToken */
    isAuthTokenRequired?: boolean;

    /** The file extension of the receipt file */
    fileExtension?: string;

    /** number of images displayed in the same parent container */
    iconSize?: IconSize;

    /** The size of the loading indicator */
    loadingIconSize?: FullScreenLoadingIndicatorIconSize;

    /** The style of the loading indicator */
    loadingIndicatorStyles?: StyleProp<ViewStyle>;

    /** Styles applied to the thumbnail container */
    thumbnailContainerStyles?: StyleProp<ViewStyle>;

    /** If the image fails to load – show the provided fallback icon */
    fallbackIcon?: IconAsset;

    /** The size of the fallback icon */
    fallbackIconSize?: number;

    /** The color of the fallback icon */
    fallbackIconColor?: string;

    /** The background color of fallback icon */
    fallbackIconBackground?: string;

    isEmptyReceipt?: boolean;

    /** Callback to be called on pressing the image */
    onPress?: () => void;

    /** Whether the receipt is a per diem request */
    isPerDiemRequest?: boolean;

    /** The transaction data in search */
    transactionItem?: TransactionListItemType | Transaction;

    /** Whether the receipt empty state should extend to the full height of the container. */
    shouldUseFullHeight?: boolean;

    /** Callback to be called when the image loads */
    onLoad?: (event?: {nativeEvent: {width: number; height: number}}) => void;

    /** Callback to be called when the image fails to load */
    onLoadFailure?: () => void;

    /** The resize mode of the image */
    resizeMode?: ImageResizeMode;

    /** Whether the receipt is a map distance request */
    isMapDistanceRequest?: boolean;

    /** Any additional styles to apply */
    style?: StyleProp<ViewStyle & ImageStyle>;
};

function ReceiptImage({
    transactionID,
    isPDFThumbnail,
    isThumbnail = false,
    shouldUseThumbnailImage = false,
    isEReceipt = false,
    source,
    isAuthTokenRequired,
    fileExtension,
    iconSize,
    loadingIconSize,
    fallbackIcon,
    fallbackIconSize,
    shouldUseInitialObjectPosition = false,
    fallbackIconColor,
    fallbackIconBackground,
    isEmptyReceipt = false,
    onPress,
    transactionItem,
    isPerDiemRequest,
    shouldUseFullHeight,
    loadingIndicatorStyles,
    thumbnailContainerStyles,
    onLoad,
    onLoadFailure,
    resizeMode,
    isMapDistanceRequest,
    style,
}: ReceiptImageProps) {
    const styles = useThemeStyles();
    const [receiptImageWidth, setReceiptImageWidth] = useState<number | undefined>(undefined);
    const lastUpdateWidthTimestampRef = useRef(new Date().getTime());

    if (isEmptyReceipt) {
        return (
            <ReceiptEmptyState
                isThumbnail
                onPress={onPress}
                disabled={!onPress}
                shouldUseFullHeight={shouldUseFullHeight}
                onLoad={onLoad}
            />
        );
    }

    if (isPDFThumbnail) {
        return (
            <PDFThumbnail
                previewSourceURL={source ?? ''}
                style={[styles.w100, styles.h100]}
                onLoadSuccess={onLoad}
            />
        );
    }

    if (isEReceipt && !isPerDiemRequest) {
        return (
            <EReceiptWithSizeCalculation
                transactionID={transactionID}
                transactionItem={transactionItem}
                shouldUseAspectRatio={shouldUseFullHeight && shouldUseAspectRatioForEReceipts}
                onLoad={onLoad}
            />
        );
    }

    if (isThumbnail || (isEReceipt && isPerDiemRequest)) {
        const props = isThumbnail && {fileExtension, isReceiptThumbnail: true};
        return (
            <View style={style ?? [styles.w100, styles.h100]}>
                <EReceiptThumbnail
                    transactionID={transactionID}
                    iconSize={iconSize}
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
                style={[styles.w100, styles.h100, style, thumbnailContainerStyles]}
                isAuthTokenRequired={isAuthTokenRequired ?? false}
                shouldDynamicallyResize={false}
                loadingIconSize={loadingIconSize}
                loadingIndicatorStyles={loadingIndicatorStyles}
                fallbackIcon={fallbackIcon}
                fallbackIconSize={fallbackIconSize}
                fallbackIconColor={fallbackIconColor}
                fallbackIconBackground={fallbackIconBackground}
                objectPosition={shouldUseInitialObjectPosition ? CONST.IMAGE_OBJECT_POSITION.INITIAL : CONST.IMAGE_OBJECT_POSITION.TOP}
                onLoad={onLoad}
                onLoadFailure={onLoadFailure}
                resizeMode={resizeMode}
            />
        );
    }

    return (
        <ImageWithLoading
            onLayout={(e) => {
                if (e.nativeEvent.layout.width !== receiptImageWidth && e.timeStamp - lastUpdateWidthTimestampRef.current > MIN_UPDATE_WIDTH_DIFF) {
                    setReceiptImageWidth(e.nativeEvent.layout.width);
                }
                lastUpdateWidthTimestampRef.current = e.timeStamp;
            }}
            source={typeof source === 'string' ? {uri: source} : source}
            style={[style, isMapDistanceRequest && styles.flex1, styles.overflowHidden]}
            isAuthTokenRequired={!!isAuthTokenRequired}
            loadingIconSize={loadingIconSize}
            loadingIndicatorStyles={loadingIndicatorStyles}
            shouldShowOfflineIndicator={false}
            objectPosition={shouldUseInitialObjectPosition ? CONST.IMAGE_OBJECT_POSITION.INITIAL : CONST.IMAGE_OBJECT_POSITION.TOP}
            onLoad={onLoad}
            shouldCalculateAspectRatioForWideImage={shouldUseFullHeight}
            imageWidthToCalculateHeight={receiptImageWidth}
            onError={onLoadFailure}
            resizeMode={resizeMode}
        />
    );
}

export type {ReceiptImageProps};
export default ReceiptImage;
