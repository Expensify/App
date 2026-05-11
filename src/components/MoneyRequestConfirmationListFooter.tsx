import React, {memo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {shouldShowReceiptEmptyState} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {Unit} from '@src/types/onyx/Policy';
import ConfirmedRoute from './ConfirmedRoute';
import InvoiceSenderField from './MoneyRequestConfirmationList/sections/InvoiceSenderField';
import PerDiemFields from './MoneyRequestConfirmationList/sections/PerDiemFields';
import ConfirmationFieldList from './MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import ConfirmationReceiptThumbnail from './MoneyRequestConfirmationListFooter/ConfirmationReceiptThumbnail';
import useCompactReceiptDimensions from './MoneyRequestConfirmationListFooter/hooks/useCompactReceiptDimensions';
import useFooterDerivedFlags from './MoneyRequestConfirmationListFooter/hooks/useFooterDerivedFlags';
import useFooterTagVisibility from './MoneyRequestConfirmationListFooter/hooks/useFooterTagVisibility';
import useReceiptThumbnailSource from './MoneyRequestConfirmationListFooter/hooks/useReceiptThumbnailSource';
import ReceiptEmptyState from './ReceiptEmptyState';

type MoneyRequestConfirmationListFooterProps = {
    /** The action to perform */
    action: IOUAction;

    /** The currency of the transaction */
    distanceRateCurrency: string;

    /** Flag indicating if the confirmation is done */
    didConfirm: boolean;

    /** The distance of the transaction */
    distance: number;

    /** The amount of the transaction */
    amount: number;

    /** The formatted amount of the transaction */
    formattedAmount: string;

    /** The formatted amount of the transaction per 1 attendee */
    formattedAmountPerAttendee: string;

    /** The error message for the form */
    formError: string;

    /** Flag indicating if there is a route */
    hasRoute: boolean;

    /** The type of the IOU */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** Flag indicating if the category is required */
    isCategoryRequired: boolean;

    /** Flag indicating if it is a distance request */
    isDistanceRequest: boolean;

    /** Flag indicating if it is a manual distance request */
    isManualDistanceRequest: boolean;

    /** Flag indicating if it is an odometer distance request */
    isOdometerDistanceRequest?: boolean;

    /** Whether the receipt is currently being stitched */
    isLoadingReceipt?: boolean;

    /** Flag indicating if it is a GPS distance request */
    isGPSDistanceRequest: boolean;

    /** Flag indicating if it is a per diem request */
    isPerDiemRequest: boolean;

    /** Flag indicating if it is a time request */
    isTimeRequest: boolean;

    /** Flag indicating if the merchant is required */
    isMerchantRequired: boolean | undefined;

    /** Flag indicating if it is a policy expense chat */
    isPolicyExpenseChat: boolean;

    /** Flag indicating if it is read-only */
    isReadOnly: boolean;

    /** Whether we're editing a split expense */
    isEditingSplitBill?: boolean;

    /** Flag indicating if it is an invoice type */
    isTypeInvoice: boolean;

    /** Function to toggle billable */
    onToggleBillable?: (isOn: boolean) => void;

    /** The policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The policy tag lists */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** The policy tag lists */
    policyTagLists: Array<ValueOf<OnyxTypes.PolicyTagLists>>;

    /** The rate of the transaction */
    rate: number | undefined;

    /** The name of the distance rate */
    distanceRateName: string | undefined;

    /** The filename of the receipt */
    receiptFilename: string;

    /** The path of the receipt */
    receiptPath: string | number;

    /** The report action ID */
    reportActionID: string | undefined;

    /** The report ID */
    reportID: string;

    /** The selected participants */
    selectedParticipants: Participant[];

    /** Flag indicating if the field error should be displayed */
    shouldDisplayFieldError: boolean;

    /** Flag indicating if the receipt should be displayed */
    shouldDisplayReceipt: boolean;

    /** Flag indicating if the categories should be shown */
    shouldShowCategories: boolean;

    /** Flag indicating if the merchant should be shown */
    shouldShowMerchant: boolean;

    /** Flag indicating if the smart scan fields should be shown */
    shouldShowSmartScanFields: boolean;

    /** Flag indicating if the amount field should be shown */
    shouldShowAmountField?: boolean;

    /** Flag indicating if the tax should be shown */
    shouldShowTax: boolean;

    /** The transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The transaction ID */
    transactionID: string | undefined;

    /** Whether the receipt can be replaced */
    isReceiptEditable?: boolean;

    /** The unit */
    unit: Unit | undefined;

    /** The PDF load error callback */
    onPDFLoadError?: () => void;

    /** The PDF password callback */
    onPDFPassword?: () => void;

    /** Function to toggle reimbursable */
    onToggleReimbursable?: (isOn: boolean) => void;

    /** Flag indicating if the description is required */
    isDescriptionRequired: boolean;

    /** Whether to show all optional fields */
    showMoreFields?: boolean;

    /** Toggles compact mode by showing all fields */
    setShowMoreFields?: (showMoreFields: boolean) => void;
};

function MoneyRequestConfirmationListFooter({
    action,
    distanceRateCurrency,
    didConfirm,
    distance,
    amount,
    formattedAmount,
    formattedAmountPerAttendee,
    formError,
    hasRoute,
    iouType,
    isCategoryRequired,
    isDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest = false,
    isLoadingReceipt = false,
    isGPSDistanceRequest,
    isPerDiemRequest,
    isTimeRequest,
    isMerchantRequired,
    isPolicyExpenseChat,
    isReadOnly,
    isEditingSplitBill = false,
    isTypeInvoice,
    onToggleBillable,
    policy,
    policyTags,
    policyTagLists,
    rate,
    distanceRateName,
    receiptFilename,
    receiptPath,
    reportActionID,
    reportID,
    selectedParticipants,
    shouldDisplayFieldError,
    shouldDisplayReceipt,
    shouldShowCategories,
    shouldShowMerchant,
    shouldShowSmartScanFields,
    shouldShowAmountField = true,
    shouldShowTax,
    transaction,
    transactionID,
    unit,
    onPDFLoadError,
    onPDFPassword,
    onToggleReimbursable,
    isReceiptEditable = false,
    isDescriptionRequired = false,
    showMoreFields = false,
    setShowMoreFields = () => {},
}: MoneyRequestConfirmationListFooterProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);

    const flags = useFooterDerivedFlags({
        action,
        iouType,
        transaction,
        policy,
        policyTagLists,
        isPolicyExpenseChat,
        isReadOnly,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
        isTypeInvoice,
        shouldShowSmartScanFields,
    });

    const {tagVisibility, previousTagsVisibility} = useFooterTagVisibility({
        shouldShowTags: flags.shouldShowTags,
        policy,
        policyTags,
        transaction,
    });

    const receiptSource = useReceiptThumbnailSource({transaction, receiptPath, receiptFilename});

    const horizontalMargin = typeof styles.moneyRequestImage.marginHorizontal === 'number' ? styles.moneyRequestImage.marginHorizontal : 0;
    const compact = useCompactReceiptDimensions({
        showMoreFields,
        isScan: flags.isScan,
        isInLandscapeMode,
        windowWidth,
        horizontalMargin,
    });

    const showReceiptEmptyState = shouldShowReceiptEmptyState(iouType, action, policy, isPerDiemRequest);
    const perDiemCustomUnit = getPerDiemCustomUnit(policy);

    return (
        <View style={compact.isCompactMode ? styles.flex1 : undefined}>
            <View>
                {isTypeInvoice && (
                    <InvoiceSenderField
                        selectedParticipants={selectedParticipants}
                        isReadOnly={isReadOnly}
                        didConfirm={didConfirm}
                        iouType={iouType}
                        reportID={reportID}
                        transaction={transaction}
                    />
                )}
                {flags.shouldShowMap && (
                    <View style={styles.confirmationListMapItem}>
                        <ConfirmedRoute transaction={transaction ?? ({} as OnyxTypes.Transaction)} />
                    </View>
                )}
                {isPerDiemRequest && action !== CONST.IOU.ACTION.SUBMIT && (
                    <PerDiemFields
                        perDiemCustomUnit={perDiemCustomUnit}
                        transaction={transaction}
                        isReadOnly={isReadOnly}
                        didConfirm={didConfirm}
                        transactionID={transactionID}
                        action={action}
                        iouType={iouType}
                        reportID={reportID}
                        shouldDisplayFieldError={shouldDisplayFieldError}
                        formError={formError}
                    />
                )}
            </View>

            {(!flags.shouldShowMap || isManualDistanceRequest || isOdometerDistanceRequest) &&
                (receiptSource.hasReceiptImageOrThumbnail || isLoadingReceipt ? (
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
                ) : (
                    showReceiptEmptyState && (
                        <ReceiptEmptyState
                            onPress={() => {
                                if (!transactionID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, Navigation.getActiveRoute()));
                            }}
                            style={[
                                compact.isCompactMode ? undefined : styles.mv3,
                                compact.isCompactMode && compact.compactReceiptStyle ? compact.compactReceiptStyle : styles.moneyRequestViewImage,
                            ]}
                        />
                    )
                ))}

            <ConfirmationFieldList
                action={action}
                iouType={iouType}
                transactionID={transactionID}
                reportID={reportID}
                reportActionID={reportActionID}
                transaction={transaction}
                policy={policy}
                policyForMovingExpenses={flags.policyForMovingExpenses}
                policyTagLists={policyTagLists}
                tagVisibility={tagVisibility}
                previousTagsVisibility={previousTagsVisibility}
                selectedParticipants={selectedParticipants}
                isReadOnly={isReadOnly}
                didConfirm={didConfirm}
                isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                shouldShowSmartScanFields={shouldShowSmartScanFields}
                shouldShowAmountField={shouldShowAmountField}
                shouldShowMerchant={shouldShowMerchant}
                shouldShowCategories={shouldShowCategories}
                shouldShowDate={flags.shouldShowDate}
                shouldShowTax={shouldShowTax}
                shouldShowAttendees={flags.shouldShowAttendees}
                shouldShowTimeRequestFields={flags.shouldShowTimeRequestFields}
                shouldShowBillable={flags.shouldShowBillable}
                shouldShowReimbursable={flags.shouldShowReimbursable}
                shouldNavigateToUpgradePath={flags.shouldNavigateToUpgradePath}
                shouldSelectPolicy={flags.shouldSelectPolicy}
                canModifyTaxFields={flags.canModifyTaxFields}
                isDistanceRequest={isDistanceRequest}
                isManualDistanceRequest={isManualDistanceRequest}
                isOdometerDistanceRequest={isOdometerDistanceRequest}
                isGPSDistanceRequest={isGPSDistanceRequest}
                isMerchantRequired={isMerchantRequired}
                isDescriptionRequired={isDescriptionRequired}
                isCategoryRequired={isCategoryRequired}
                isPolicyExpenseChat={isPolicyExpenseChat}
                isEditingSplitBill={isEditingSplitBill}
                isPerDiemRequest={isPerDiemRequest}
                shouldDisplayFieldError={shouldDisplayFieldError}
                formError={formError}
                iouCurrencyCode={flags.iouCurrencyCode}
                amount={amount}
                formattedAmount={formattedAmount}
                formattedAmountPerAttendee={formattedAmountPerAttendee}
                distance={distance}
                hasRoute={hasRoute}
                unit={unit}
                rate={rate}
                distanceRateName={distanceRateName}
                distanceRateCurrency={distanceRateCurrency}
                onToggleReimbursable={onToggleReimbursable}
                onToggleBillable={onToggleBillable}
                setShowMoreFields={setShowMoreFields}
                isCompactMode={compact.isCompactMode}
            />
        </View>
    );
}

export default memo(MoneyRequestConfirmationListFooter);
