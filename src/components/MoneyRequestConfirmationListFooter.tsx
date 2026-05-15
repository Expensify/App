import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {isScanRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {Unit} from '@src/types/onyx/Policy';
import ConfirmationFieldList from './MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import useFooterDerivedFlags from './MoneyRequestConfirmationListFooter/hooks/useFooterDerivedFlags';
import useFooterTagVisibility from './MoneyRequestConfirmationListFooter/hooks/useFooterTagVisibility';
import DistanceMapSection from './MoneyRequestConfirmationListFooter/sections/DistanceMapSection';
import InvoiceSenderSection from './MoneyRequestConfirmationListFooter/sections/InvoiceSenderSection';
import PerDiemSection from './MoneyRequestConfirmationListFooter/sections/PerDiemSection';
import ReceiptSection from './MoneyRequestConfirmationListFooter/sections/ReceiptSection';

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

    /** Clears specific form errors by key */
    clearFormErrors: (errors: string[]) => void;

    /** Sets a form error message */
    setFormError: (error: TranslationPaths | '') => void;

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

    /** Triggers submit from inline inputs */
    onSubmitForm?: () => void;
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
    clearFormErrors,
    setFormError,
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
    onSubmitForm,
}: MoneyRequestConfirmationListFooterProps) {
    const styles = useThemeStyles();
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

    // ReceiptSection owns the receipt thumbnail + compact-mode hooks; the outer wrapper only needs this boolean.
    const isCompactMode = !showMoreFields && isScanRequest(transaction) && !isInLandscapeMode;

    return (
        <View style={isCompactMode ? styles.flex1 : undefined}>
            <View>
                <InvoiceSenderSection
                    iouType={iouType}
                    reportID={reportID}
                    selectedParticipants={selectedParticipants}
                    isReadOnly={isReadOnly}
                    didConfirm={didConfirm}
                    transaction={transaction}
                />
                <DistanceMapSection
                    transaction={transaction}
                    isDistanceRequest={isDistanceRequest}
                    isManualDistanceRequest={isManualDistanceRequest}
                    isOdometerDistanceRequest={isOdometerDistanceRequest}
                    iouType={iouType}
                    isReadOnly={isReadOnly}
                />
                <PerDiemSection
                    action={action}
                    iouType={iouType}
                    isPerDiemRequest={isPerDiemRequest}
                    transaction={transaction}
                    reportID={reportID}
                    transactionID={transactionID}
                    policy={policy}
                    isReadOnly={isReadOnly}
                    didConfirm={didConfirm}
                    shouldDisplayFieldError={shouldDisplayFieldError}
                    formError={formError}
                />
            </View>

            <ReceiptSection
                transaction={transaction}
                transactionID={transactionID}
                reportID={reportID}
                action={action}
                iouType={iouType}
                policy={policy}
                isPerDiemRequest={isPerDiemRequest}
                isDistanceRequest={isDistanceRequest}
                isManualDistanceRequest={isManualDistanceRequest}
                isOdometerDistanceRequest={isOdometerDistanceRequest}
                isReadOnly={isReadOnly}
                isReceiptEditable={isReceiptEditable}
                shouldDisplayReceipt={shouldDisplayReceipt}
                isLoadingReceipt={isLoadingReceipt}
                receiptPath={receiptPath}
                receiptFilename={receiptFilename}
                showMoreFields={showMoreFields}
                onPDFLoadError={onPDFLoadError}
                onPDFPassword={onPDFPassword}
            />

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
                clearFormErrors={clearFormErrors}
                setFormError={setFormError}
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
                isCompactMode={isCompactMode}
                onSubmitForm={onSubmitForm}
            />
        </View>
    );
}

export default MoneyRequestConfirmationListFooter;
