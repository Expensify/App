/* eslint-disable react/jsx-props-no-spreading */
import {Str} from 'expensify-common';
import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmedRoute from '@components/ConfirmedRoute';
import type {IconSize} from '@components/EReceiptThumbnail';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import type {ReceiptImageProps} from '@components/ReceiptImage';
import ReceiptImage from '@components/ReceiptImage';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportIDForExpense} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasEReceipt, hasReceiptSource, isDistanceRequest, isFetchingWaypointsFromServer, isManualDistanceRequest, isPerDiemRequest} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportActionItemImageProps = {
    /** thumbnail URI for the image */
    thumbnail?: string;

    isEmptyReceipt?: boolean;

    /** The file type of the receipt */
    fileExtension?: string;

    /** whether or not we are going to display a thumbnail */
    isThumbnail?: boolean;

    /** URI for the image or local numeric reference for the image  */
    image?: string | number;

    /** whether to enable the image preview modal */
    enablePreviewModal?: boolean;

    /* The transaction associated with this image, if any. Passed for handling eReceipts. */
    transaction?: OnyxEntry<Transaction>;

    /** whether thumbnail is refer the local file or not */
    isLocalFile?: boolean;

    /** Filename of attachment */
    filename?: string;

    /** Whether there are other images displayed in the same parent container */
    isSingleImage?: boolean;

    /** Whether the map view should have border radius  */
    shouldMapHaveBorderRadius?: boolean;

    /** Whether the receipt is not editable */
    readonly?: boolean;

    /** whether or not this report is from review duplicates */
    isFromReviewDuplicates?: boolean;

    /** Merge transaction ID to show in merge transaction flow */
    mergeTransactionID?: string;

    /** Callback to be called on pressing the image */
    onPress?: () => void;

    /** Whether the receipt empty state should extend to the full height of the container. */
    shouldUseFullHeight?: boolean;

    /** The report associated with this image, if any. Used to pass report directly instead of relaying on context. */
    report?: OnyxEntry<Report>;

    /** Whether to use the thumbnail image instead of the full image */
    shouldUseThumbnailImage?: boolean;

    /** Callback to be called when the image loads */
    onLoad?: (event?: {nativeEvent: {width: number; height: number}}) => void;

    /** Callback to be called when the image fails to load */
    onLoadFailure?: () => void;
};

/**
 * An image with an optional thumbnail that fills its parent container. If the thumbnail is passed,
 * we try to resolve both the image and thumbnail from the API. Similar to ImageRenderer, we show
 * and optional preview modal as well.
 */

function ReportActionItemImage({
    thumbnail,
    isThumbnail,
    image,
    enablePreviewModal = false,
    transaction,
    isLocalFile = false,
    isEmptyReceipt = false,
    fileExtension,
    filename,
    isSingleImage = true,
    readonly = false,
    shouldMapHaveBorderRadius,
    mergeTransactionID,
    onPress,
    shouldUseFullHeight,
    report: reportProp,
    shouldUseThumbnailImage,
    onLoad,
    onLoadFailure,
}: ReportActionItemImageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Receipt']);
    const isMapDistanceRequest = !!transaction && isDistanceRequest(transaction) && !isManualDistanceRequest(transaction);
    const hasPendingWaypoints = transaction && isFetchingWaypointsFromServer(transaction);
    const hasErrors = !isEmptyObject(transaction?.errors) || !isEmptyObject(transaction?.errorFields?.route) || !isEmptyObject(transaction?.errorFields?.waypoints);
    const showMapAsImage = isMapDistanceRequest && (hasErrors || hasPendingWaypoints);

    if (showMapAsImage) {
        return (
            <View style={[styles.w100, styles.h100]}>
                <ConfirmedRoute
                    transaction={transaction}
                    isSmallerIcon={!isSingleImage}
                    shouldHaveBorderRadius={shouldMapHaveBorderRadius}
                    interactive={false}
                    requireRouteToDisplayMap
                />
            </View>
        );
    }

    const originalImageSource = tryResolveUrlFromApiRoot(image ?? '');
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail ?? '');
    const isEReceipt = transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction);
    const isPDF = filename && Str.isPDF(filename);

    let propsObj: ReceiptImageProps;

    if (isEReceipt) {
        propsObj = {isEReceipt: true, transactionID: transaction.transactionID, iconSize: isSingleImage ? 'medium' : ('small' as IconSize), shouldUseFullHeight};
    } else if (thumbnail && !isLocalFile) {
        propsObj = {
            shouldUseThumbnailImage: shouldUseThumbnailImage ?? true,

            // PDF won't have originalImage that we can use. Use thumbnail instead
            // We explicitly want to use || instead of nullish-coalescing because shouldUseThumbnailImage can be false.
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            source: shouldUseThumbnailImage || isPDF ? thumbnailSource : originalImageSource,
            fallbackIcon: icons.Receipt,
            fallbackIconSize: isSingleImage ? variables.iconSizeSuperLarge : variables.iconSizeExtraLarge,
            isAuthTokenRequired: true,

            // If the image is full height, use initial position to make sure it will grow properly to fill the container
            shouldUseInitialObjectPosition: isMapDistanceRequest && !shouldUseFullHeight,
        };
    } else if (isLocalFile && isPDF && typeof originalImageSource === 'string') {
        propsObj = {isPDFThumbnail: true, source: originalImageSource};
    } else {
        propsObj = {
            isThumbnail,
            ...(isThumbnail && {iconSize: (isSingleImage ? 'medium' : 'small') as IconSize, fileExtension}),
            shouldUseThumbnailImage: shouldUseThumbnailImage ?? true,
            isAuthTokenRequired: false,
            source: shouldUseThumbnailImage ? (thumbnail ?? image ?? '') : originalImageSource,

            // If the image is full height, use initial position to make sure it will grow properly to fill the container
            shouldUseInitialObjectPosition: isMapDistanceRequest && !shouldUseFullHeight,
            isEmptyReceipt,
            onPress,
        };
    }

    propsObj.isPerDiemRequest = isPerDiemRequest(transaction);

    if (enablePreviewModal) {
        return (
            <ShowContextMenuContext.Consumer>
                {({report, transactionThreadReport}) => (
                    <PressableWithoutFocus
                        style={[styles.w100, styles.h100, styles.noOutline as ViewStyle]}
                        onPress={() =>
                            Navigation.navigate(
                                ROUTES.TRANSACTION_RECEIPT.getRoute(
                                    transactionThreadReport?.reportID ?? report?.reportID ?? reportProp?.reportID ?? getReportIDForExpense(transaction),
                                    transaction?.transactionID,
                                    readonly,
                                    mergeTransactionID,
                                ),
                            )
                        }
                        accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.RECEIPT.IMAGE}
                    >
                        <ReceiptImage
                            {...propsObj}
                            onLoad={onLoad}
                            shouldUseFullHeight={shouldUseFullHeight}
                            onLoadFailure={onLoadFailure}
                            isMapDistanceRequest={isMapDistanceRequest}
                        />
                    </PressableWithoutFocus>
                )}
            </ShowContextMenuContext.Consumer>
        );
    }

    return (
        <ReceiptImage
            {...propsObj}
            shouldUseFullHeight={shouldUseFullHeight}
            thumbnailContainerStyles={styles.thumbnailImageContainerHover}
            onLoad={onLoad}
            onLoadFailure={onLoadFailure}
        />
    );
}

export default ReportActionItemImage;
