/* eslint-disable react/jsx-props-no-spreading */
import {Str} from 'expensify-common';
import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmedRoute from '@components/ConfirmedRoute';
import type {IconSize} from '@components/EReceiptThumbnail';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import type {ReceiptImageProps} from '@components/ReceiptImage';
import ReceiptImage from '@components/ReceiptImage';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportActionItemImageProps = {
    /** thumbnail URI for the image */
    thumbnail?: string;

    /** The file type of the receipt */
    fileExtension?: string;

    /** whether or not we are going to display a thumbnail */
    isThumbnail?: boolean;

    /** URI for the image or local numeric reference for the image  */
    image?: string;

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
    fileExtension,
    filename,
    isSingleImage = true,
    readonly = false,
    shouldMapHaveBorderRadius,
}: ReportActionItemImageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isDistanceRequest = !!transaction && TransactionUtils.isDistanceRequest(transaction);
    const hasPendingWaypoints = transaction && TransactionUtils.isFetchingWaypointsFromServer(transaction);
    const hasErrors = !isEmptyObject(transaction?.errors) || !isEmptyObject(transaction?.errorFields);
    const showMapAsImage = isDistanceRequest && (hasErrors || hasPendingWaypoints);

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

    const attachmentModalSource = tryResolveUrlFromApiRoot(image ?? '');
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail ?? '');
    const isEReceipt = transaction && !TransactionUtils.hasReceiptSource(transaction) && TransactionUtils.hasEReceipt(transaction);

    let propsObj: ReceiptImageProps;

    if (isEReceipt) {
        propsObj = {isEReceipt: true, transactionID: transaction.transactionID, iconSize: isSingleImage ? 'medium' : ('small' as IconSize)};
    } else if (thumbnail && !isLocalFile) {
        propsObj = {
            shouldUseThumbnailImage: true,
            source: thumbnailSource,
            fallbackIcon: Expensicons.Receipt,
            fallbackIconSize: isSingleImage ? variables.iconSizeSuperLarge : variables.iconSizeExtraLarge,
            isAuthTokenRequired: true,
            shouldUseInitialObjectPosition: isDistanceRequest,
        };
    } else if (isLocalFile && filename && Str.isPDF(filename) && typeof attachmentModalSource === 'string') {
        propsObj = {isPDFThumbnail: true, source: attachmentModalSource};
    } else {
        propsObj = {
            isThumbnail,
            ...(isThumbnail && {iconSize: (isSingleImage ? 'medium' : 'small') as IconSize, fileExtension}),
            shouldUseThumbnailImage: true,
            isAuthTokenRequired: false,
            source: thumbnail ?? image ?? '',
            shouldUseInitialObjectPosition: isDistanceRequest,
        };
    }

    if (enablePreviewModal) {
        return (
            <ShowContextMenuContext.Consumer>
                {({report, transactionThreadReport}) => (
                    <PressableWithoutFocus
                        style={[styles.w100, styles.h100, styles.noOutline as ViewStyle]}
                        onPress={() => Navigation.navigate(ROUTES.TRANSACTION_RECEIPT.getRoute(transactionThreadReport?.reportID ?? report?.reportID, transaction?.transactionID, readonly))}
                        accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                        accessibilityRole={CONST.ROLE.BUTTON}
                    >
                        <ReceiptImage {...propsObj} />
                    </PressableWithoutFocus>
                )}
            </ShowContextMenuContext.Consumer>
        );
    }

    return <ReceiptImage {...propsObj} />;
}

ReportActionItemImage.displayName = 'ReportActionItemImage';

export default ReportActionItemImage;
