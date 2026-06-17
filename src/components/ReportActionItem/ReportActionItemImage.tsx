import {Str} from 'expensify-common';
import React from 'react';
import type {ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmedRoute from '@components/ConfirmedRoute';
import type {IconSize} from '@components/EReceiptThumbnail';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import type {ReceiptImageProps} from '@components/ReceiptImage';
import ReceiptImage from '@components/ReceiptImage';
import {useShowContextMenuState} from '@components/ShowContextMenuContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasHoverSupport} from '@libs/DeviceCapabilities';
import {getReportIDForExpense} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {
    hasEReceipt,
    hasPendingDistanceReceiptRegeneration,
    hasReceiptSource,
    isDistanceRequest,
    isManualDistanceRequest,
    isMapBasedDistanceRequest,
    isPerDiemRequest,
} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ReceiptPDFOverlay from './ReceiptPDFOverlay';

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

    /** Whether the receipt can be hover-zoomed. When true, remote PDFs render the actual PDF on top of the thumbnail so magnification stays sharp (web only). */
    canZoomReceipt?: boolean;

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
    canZoomReceipt = false,
    onLoad,
    onLoadFailure,
}: ReportActionItemImageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Receipt']);
    const {report: contextReport, transactionThreadReport} = useShowContextMenuState();
    const isMapDistanceRequest = !!transaction && isDistanceRequest(transaction) && !isManualDistanceRequest(transaction);
    const hasErrors = !isEmptyObject(transaction?.errors) || !isEmptyObject(transaction?.errorFields?.route) || !isEmptyObject(transaction?.errorFields?.waypoints);
    // While the receipt is regenerating its stored URL is stale, so draw the live route from `routes.coordinates`
    // (via `ConfirmedRoute`) instead of loading the now-404'd image.
    const showMapAsImage = isMapDistanceRequest && (hasErrors || hasPendingDistanceReceiptRegeneration(transaction));

    if (showMapAsImage) {
        return (
            <View style={[styles.w100, shouldUseFullHeight ? {aspectRatio: 1} : styles.h100]}>
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

    const localSource = transaction?.receipt?.localSource;
    const effectiveIsLocalFile = isLocalFile || !!localSource;
    const effectiveThumbnail = localSource ?? thumbnail;
    const receiptURIs = transaction ? getThumbnailAndImageURIs(transaction, null, null) : undefined;
    const effectivePreviewUri = localSource ? undefined : receiptURIs?.thumbnail320;
    const effectiveImage = localSource != null && typeof image === 'string' ? localSource : image;

    const originalImageSource = tryResolveUrlFromApiRoot(effectiveImage ?? '');
    const thumbnailSource = tryResolveUrlFromApiRoot(effectiveThumbnail ?? '');
    const previewUriSource = effectivePreviewUri ? tryResolveUrlFromApiRoot(effectivePreviewUri) : undefined;
    const isEReceipt = transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction);
    const isPDF = filename && Str.isPDF(filename);

    let propsObj: ReceiptImageProps;

    if (isEReceipt) {
        propsObj = {isEReceipt: true, transactionID: transaction.transactionID, iconSize: isSingleImage ? 'medium' : ('small' as IconSize), shouldUseFullHeight};
    } else if (effectiveThumbnail && !effectiveIsLocalFile) {
        propsObj = {
            shouldUseThumbnailImage: shouldUseThumbnailImage ?? true,

            source: thumbnailSource,
            fallbackIcon: icons.Receipt,
            fallbackIconSize: isSingleImage ? variables.iconSizeSuperLarge : variables.iconSizeExtraLarge,
            isAuthTokenRequired: true,

            // If the image is full height, use initial position to make sure it will grow properly to fill the container
            shouldUseInitialObjectPosition: isMapDistanceRequest && !shouldUseFullHeight,
        };
    } else if (effectiveIsLocalFile && isPDF && typeof originalImageSource === 'string') {
        propsObj = {isPDFThumbnail: true, source: originalImageSource};
    } else {
        propsObj = {
            isThumbnail,
            ...(isThumbnail && {iconSize: (isSingleImage ? 'medium' : 'small') as IconSize, fileExtension}),
            shouldUseThumbnailImage: shouldUseThumbnailImage ?? true,
            isAuthTokenRequired: false,
            source: shouldUseThumbnailImage ? (effectiveThumbnail ?? effectiveImage ?? '') : originalImageSource,

            // If the image is full height, use initial position to make sure it will grow properly to fill the container
            shouldUseInitialObjectPosition: isMapDistanceRequest && !shouldUseFullHeight,
            isEmptyReceipt,
            onPress,
        };
    }

    propsObj.isPerDiemRequest = isPerDiemRequest(transaction);

    // A remote PDF is shown as the server's low-resolution JPG thumbnail, which blurs when hover-zoomed.
    // Where zooming is available (web only), render the actual PDF on top of the thumbnail so the magnified
    // view stays sharp. The thumbnail stays underneath as an instant preview and as a fallback if the PDF fails.
    // Map/route distance requests are excluded: their hover overlay is a DistanceEReceipt card, not the PDF.
    // isMapBasedDistanceRequest covers map, GPS, and manual-typed transactions that still carry waypoints.
    const pdfSourceURL = typeof originalImageSource === 'string' && !!originalImageSource ? originalImageSource : undefined;
    const isRemotePDF = !!isPDF && !effectiveIsLocalFile && !isEReceipt && !isMapBasedDistanceRequest(transaction) && !!pdfSourceURL;
    const shouldOverlayHighResPDF = canZoomReceipt && isRemotePDF && hasHoverSupport();

    const renderReceiptContent = (receiptImage: React.ReactNode) =>
        shouldOverlayHighResPDF ? (
            <View style={[styles.w100, styles.h100]}>
                {receiptImage}
                <View
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                >
                    <ReceiptPDFOverlay
                        sourceURL={pdfSourceURL}
                        onLoadFailure={onLoadFailure}
                    />
                </View>
            </View>
        ) : (
            receiptImage
        );

    if (enablePreviewModal) {
        return (
            <PressableWithoutFocus
                style={[styles.w100, styles.h100, styles.noOutline as ViewStyle]}
                onPress={() =>
                    Navigation.navigate(
                        ROUTES.TRANSACTION_RECEIPT.getRoute(
                            transactionThreadReport?.reportID ?? contextReport?.reportID ?? reportProp?.reportID ?? getReportIDForExpense(transaction),
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
                {renderReceiptContent(
                    <ReceiptImage
                        {...propsObj}
                        onLoad={onLoad}
                        shouldUseFullHeight={shouldUseFullHeight}
                        onLoadFailure={onLoadFailure}
                        previewUri={previewUriSource}
                    />,
                )}
            </PressableWithoutFocus>
        );
    }

    return renderReceiptContent(
        <ReceiptImage
            {...propsObj}
            shouldUseFullHeight={shouldUseFullHeight}
            thumbnailContainerStyles={styles.thumbnailImageContainerHover}
            onLoad={onLoad}
            onLoadFailure={onLoadFailure}
            previewUri={previewUriSource}
        />,
    );
}

export default ReportActionItemImage;
