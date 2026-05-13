import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmationReceiptThumbnail from '@components/MoneyRequestConfirmationListFooter/ConfirmationReceiptThumbnail';
import useCompactReceiptDimensions from '@components/MoneyRequestConfirmationListFooter/hooks/useCompactReceiptDimensions';
import useReceiptThumbnailSource from '@components/MoneyRequestConfirmationListFooter/hooks/useReceiptThumbnailSource';
import ReceiptEmptyState from '@components/ReceiptEmptyState';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {shouldShowReceiptEmptyState} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isFetchingWaypointsFromServer, isScanRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReceiptSectionProps = {
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    transactionID: string | undefined;
    reportID: string;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    isPerDiemRequest: boolean;
    isDistanceRequest: boolean;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    isReadOnly: boolean;
    isReceiptEditable: boolean;
    shouldDisplayReceipt: boolean;
    isLoadingReceipt: boolean;
    receiptPath: string | number;
    receiptFilename: string;
    showMoreFields: boolean;
    onPDFLoadError?: () => void;
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

    // Mirror the shouldShowMap logic to determine whether the receipt area should render.
    // When a GPS distance map is visible, the receipt is hidden (unless manual/odometer).
    const hasPendingWaypoints = transaction && isFetchingWaypointsFromServer(transaction);
    const hasErrors = !isEmptyObject(transaction?.errors) || !isEmptyObject(transaction?.errorFields?.route) || !isEmptyObject(transaction?.errorFields?.waypoints);
    const shouldShowMap =
        isDistanceRequest && !isManualDistanceRequest && !isOdometerDistanceRequest && [hasErrors, hasPendingWaypoints, iouType !== CONST.IOU.TYPE.SPLIT, !isReadOnly].some(Boolean);
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
