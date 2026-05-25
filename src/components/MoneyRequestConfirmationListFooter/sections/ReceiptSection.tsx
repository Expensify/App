import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmationReceiptThumbnail from '@components/MoneyRequestConfirmationListFooter/ConfirmationReceiptThumbnail';
import useCompactReceiptDimensions from '@components/MoneyRequestConfirmationListFooter/hooks/useCompactReceiptDimensions';
import useReceiptThumbnailSource from '@components/MoneyRequestConfirmationListFooter/hooks/useReceiptThumbnailSource';
import shouldShowDistanceMap from '@components/MoneyRequestConfirmationListFooter/shouldShowDistanceMap';
import ReceiptEmptyState from '@components/ReceiptEmptyState';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {shouldShowReceiptEmptyState} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isScanRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type ReceiptSectionProps = {
    /** Active transaction (drives receipt source resolution + scan-mode compact dimensions) */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** ID of the active transaction */
    transactionID: string | undefined;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** Action being performed (drives the receipt-scan navigation target) */
    action: IOUAction;

    /** Type of IOU being confirmed */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** Active policy (used to decide whether the receipt empty state should render) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether the active transaction is a per-diem request */
    isPerDiemRequest: boolean;

    /** Whether the active transaction is a distance request (suppresses receipt area unless manual/odometer) */
    isDistanceRequest: boolean;

    /** Whether the active transaction is a manual distance request */
    isManualDistanceRequest: boolean;

    /** Whether the active transaction is an odometer-driven distance request */
    isOdometerDistanceRequest: boolean;

    /** Whether the surface is read-only */
    isReadOnly: boolean;

    /** Whether the receipt can be replaced */
    isReceiptEditable: boolean;

    /** Whether the receipt should be displayed */
    shouldDisplayReceipt: boolean;

    /** Whether the receipt is currently being stitched */
    isLoadingReceipt: boolean;

    /** Path of the receipt asset (URL or local) */
    receiptPath: string | number;

    /** Filename of the receipt asset */
    receiptFilename: string;

    /** Whether optional fields are expanded (drives compact-mode dimensions) */
    showMoreFields: boolean;

    /** Callback when the receipt PDF fails to load */
    onPDFLoadError?: () => void;

    /** Callback when the receipt PDF requires a password */
    onPDFPassword?: () => void;
};

function ReceiptSection({
    transaction,
    transactionID,
    reportID,
    action,
    iouType,
    policy,
    isPerDiemRequest,
    isDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    isReadOnly,
    isReceiptEditable,
    shouldDisplayReceipt,
    isLoadingReceipt,
    receiptPath,
    receiptFilename,
    showMoreFields,
    onPDFLoadError,
    onPDFPassword,
}: ReceiptSectionProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const isInLandscapeMode = useIsInLandscapeMode();

    const receiptSource = useReceiptThumbnailSource({transaction, receiptPath, receiptFilename});

    const horizontalMargin = typeof styles.moneyRequestImage.marginHorizontal === 'number' ? styles.moneyRequestImage.marginHorizontal : 0;
    const isScan = isScanRequest(transaction);
    const compact = useCompactReceiptDimensions({
        showMoreFields,
        isScan,
        isInLandscapeMode,
        windowWidth,
        horizontalMargin,
    });

    // When a GPS distance map is visible, the receipt is hidden (unless manual/odometer).
    const shouldShowMap = shouldShowDistanceMap({transaction, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest, iouType, isReadOnly});
    const shouldShowReceiptArea = !shouldShowMap || isManualDistanceRequest || isOdometerDistanceRequest;

    if (!shouldShowReceiptArea) {
        return null;
    }

    if (receiptSource.hasReceiptImageOrThumbnail || isLoadingReceipt) {
        return (
            <ConfirmationReceiptThumbnail
                transactionID={transactionID}
                reportID={reportID}
                action={action}
                iouType={iouType}
                isReceiptEditable={isReceiptEditable}
                shouldDisplayReceipt={shouldDisplayReceipt}
                isLoadingReceipt={isLoadingReceipt}
                isCompactMode={compact.isCompactMode}
                isLocalFile={receiptSource.isLocalFile}
                isThumbnail={receiptSource.isThumbnail}
                fileExtension={receiptSource.fileExtension}
                receiptFilename={receiptFilename}
                receiptThumbnail={receiptSource.receiptThumbnail}
                resolvedReceiptImage={receiptSource.resolvedReceiptImage as string | undefined}
                effectiveReceiptSource={receiptSource.effectiveReceiptSource}
                isOdometerDistanceRequest={isOdometerDistanceRequest}
                isDistanceRequest={isDistanceRequest}
                compactReceiptContainerStyle={compact.compactReceiptContainerStyle}
                onPDFLoadError={onPDFLoadError}
                onPDFPassword={onPDFPassword}
                onCompactReceiptContainerLayout={compact.handleCompactReceiptContainerLayout}
                onReceiptLoad={compact.handleReceiptLoad}
            />
        );
    }

    const showReceiptEmptyState = shouldShowReceiptEmptyState(iouType, action, policy, isPerDiemRequest);
    if (!showReceiptEmptyState) {
        return null;
    }

    return (
        <ReceiptEmptyState
            onPress={() => {
                if (!transactionID) {
                    return;
                }
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, Navigation.getActiveRoute()));
            }}
            style={[compact.isCompactMode ? undefined : styles.mv3, compact.isCompactMode && compact.compactReceiptStyle ? compact.compactReceiptStyle : styles.moneyRequestViewImage]}
        />
    );
}

export default ReceiptSection;
export type {ReceiptSectionProps};
