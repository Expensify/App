import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import MoneyRequestConfirmationListFooter from '@components/MoneyRequestConfirmationListFooter';

import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useThemeStyles from '@hooks/useThemeStyles';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil} from '@libs/IOUUtils';
import {
    getCreated,
    getCurrency,
    hasValidModifiedAmount,
    isDistanceRequest as isDistanceRequestUtil,
    isGPSDistanceRequest as isGPSDistanceRequestUtil,
    isManualDistanceRequest as isManualDistanceRequestUtil,
} from '@libs/TransactionUtils';

import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import ConfirmationListLayout from './ConfirmationListLayout';
import ConfirmationTelemetry from './ConfirmationTelemetry';
import DistanceRequestController from './DistanceRequestController';
import FieldAutoSelector from './FieldAutoSelector';
import useConfirmationListData from './hooks/useConfirmationListData';
import useDistanceRequestState from './hooks/useDistanceRequestState';
import useTaxAmount from './hooks/useTaxAmount';
import SplitBillController from './SplitBillController';
import TaxController from './TaxController';

type MoneyRequestConfirmationListProps = {
    /** Callback to inform parent modal of success */
    onConfirm?: () => void;

    /** Opens the participant picker owned by the page hosting this list. Pages that cannot show an editable participant row pass a no-op. */
    onOpenParticipantPicker: () => void;

    /** Whether the parent-owned participant picker modal is currently open (new manual expense flow). Drives amount autofocus on picker close. */
    isParticipantPickerVisible?: boolean;

    /** Callback to parent modal to pay someone */
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;

    iouType?: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    onToggleBillable?: (isOn: boolean) => void;

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipants: Participant[];

    /** Payee of the expense with login */
    payeePersonalDetails?: OnyxEntry<OnyxTypes.PersonalDetails> | null;

    /** Should the list be read only, and not editable? */
    isReadOnly?: boolean;

    expensesNumber?: number;
    policyID?: string;
    reportID?: string;

    /** File path of the receipt */
    receiptPath?: string | number;

    receiptFilename?: string;

    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Whether the expense is an odometer distance expense */
    isOdometerDistanceRequest?: boolean;

    /** Whether the odometer receipt is currently being stitched */
    isLoadingReceipt?: boolean;

    /** Error message from the odometer receipt stitcher, rendered below the receipt */
    receiptStitchError?: string | null;

    /** Whether the expense is a per diem expense */
    isPerDiemRequest?: boolean;

    /** Whether the expense is a time expense */
    isTimeRequest?: boolean;

    /** Whether we're editing a split expense */
    isEditingSplitBill?: boolean;

    /** Whether we can navigate to receipt page */
    shouldDisplayReceipt?: boolean;

    /** Whether we should show the amount, date, and merchant fields. */
    shouldShowSmartScanFields?: boolean;

    /** Whether this surface offers manual entry of the amount / merchant / date. False for splits, test receipts and moved tracked expenses. */
    canEnterScanFieldsManually?: boolean;

    /** ID of a partially filled Scan among the transactions being confirmed. Can be a receipt other than the one on screen. */
    partiallyManuallyFilledScanID?: string;

    /** Brings another of the confirmed transactions on screen, so its inline errors are the ones the user sees */
    onSwitchToTransaction?: (transactionID: string) => void;

    /** A flag for verifying that the current report is a sub-report of a expense chat */
    isPolicyExpenseChat?: boolean;

    hasSmartScanFailed?: boolean;
    reportActionID?: string;
    action?: IOUAction;

    /** Whether the expense is confirmed or not */
    isConfirmed?: boolean;

    /** Whether the expense is in the process of being confirmed */
    isConfirming?: boolean;

    /** Whether the receipt can be replaced */
    isReceiptEditable?: boolean;

    onPDFLoadError?: () => void;
    onPDFPassword?: () => void;
    onToggleReimbursable?: (isOn: boolean) => void;
    showRemoveExpenseConfirmModal?: () => void;

    /** When true, hide the "To:" section (e.g. when adding an expense directly to the current report) */
    shouldHideToSection?: boolean;
};

function MoneyRequestConfirmationList({
    transaction,
    onSendMoney,
    onConfirm,
    onOpenParticipantPicker,
    isParticipantPickerVisible = false,
    iouType = CONST.IOU.TYPE.SUBMIT,
    isOdometerDistanceRequest = false,
    isLoadingReceipt = false,
    receiptStitchError,
    isPerDiemRequest = false,
    isPolicyExpenseChat = false,
    shouldShowSmartScanFields = true,
    canEnterScanFieldsManually = false,
    partiallyManuallyFilledScanID,
    onSwitchToTransaction,
    isEditingSplitBill,
    isReceiptEditable,
    selectedParticipants: selectedParticipantsProp,
    payeePersonalDetails: payeePersonalDetailsProp,
    isReadOnly = false,
    policyID,
    reportID = '',
    receiptPath = '',
    receiptFilename = '',
    onToggleBillable,
    hasSmartScanFailed,
    reportActionID,
    action = CONST.IOU.ACTION.CREATE,
    shouldDisplayReceipt = false,
    expensesNumber = 0,
    isConfirmed,
    isConfirming,
    onPDFLoadError,
    onPDFPassword,
    onToggleReimbursable,
    showRemoveExpenseConfirmModal,
    isTimeRequest = false,
    shouldHideToSection = false,
}: MoneyRequestConfirmationListProps) {
    const styles = useThemeStyles();

    const isDistanceRequest = isDistanceRequestUtil(transaction);
    const isManualDistanceRequest = isManualDistanceRequestUtil(transaction);
    const isGPSDistanceRequest = isGPSDistanceRequestUtil(transaction);

    const iouAmount = hasValidModifiedAmount(transaction) ? Number(transaction?.modifiedAmount) : (transaction?.amount ?? 0);
    const iouCurrencyCode = getCurrency(transaction);

    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseUtil(action);
    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: policyID,
        action,
        iouType,
        isPerDiemRequest,
    });

    const distanceState = useDistanceRequestState({
        transaction,
        policy,
        policyID,
        policyForMovingExpenses,
        isMovingTransactionFromTrackExpense,
        isDistanceRequest,
        iouAmount,
        iouCurrencyCode,
    });
    const {defaultRate, mileageRate, unit, rate, currency, distance, shouldCalculateDistanceAmount, hasRoute, isDistanceRequestWithPendingRoute, distanceRequestAmount} = distanceState;

    const {
        sections,
        listRef,
        footerContent,
        isCompactMode,
        navigateToParticipantPage,
        dismissParticipantRowError,
        amountDisplay,
        requiredFlags,
        visibilityFlags,
        errorState,
        compactControls,
        policyTags,
        policyTagLists,
        policyCategories,
        transactionID,
        iouCategory,
        customUnitRateID,
        previousTransactionCurrency,
        currentUserAccountID,
        isScanRequest,
        isTypeSplit,
        isTypeInvoice,
        isCategoryRequired,
        isFocused,
        shouldShowCategories,
        shouldShowTax,
        selectedParticipants,
        didConfirm,
        confirm,
        scrollFocusedInputIntoView,
        setFormError,
        clearFormErrors,
        setIsTaxAmountEmpty,
    } = useConfirmationListData({
        transaction,
        action,
        iouType,
        policyID,
        reportID,
        selectedParticipants: selectedParticipantsProp,
        payeePersonalDetails: payeePersonalDetailsProp,
        isReadOnly,
        isPolicyExpenseChat,
        isEditingSplitBill,
        expensesNumber,
        receiptPath,
        isConfirmed,
        isConfirming,
        shouldShowSmartScanFields,
        canEnterScanFieldsManually,
        partiallyManuallyFilledScanID,
        hasSmartScanFailed,
        shouldHideToSection,
        isLoadingReceipt,
        onConfirm,
        onSendMoney,
        onOpenParticipantPicker,
        onSwitchToTransaction,
        showRemoveExpenseConfirmModal,
        isPerDiemRequest,
        isTimeRequest,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        distanceState,
    });

    const shouldShowRateAutoUpdatedTooltip =
        isDistanceRequest && !!transaction?.comment?.customUnit?.rateAutoUpdated && !!transaction.created && DistanceRequestUtils.isRateEligibleForDate(mileageRate, transaction.created);

    const {defaultTaxCode, defaultTaxValue, shouldKeepCurrentTaxSelection, taxAmountInSmallestCurrencyUnits} = useTaxAmount({
        transaction,
        policy,
        policyForMovingExpenses,
        isDistanceRequest,
        isMovingTransactionFromTrackExpense,
        customUnitRateID,
        distance,
        distanceUnit: unit,
        previousTransactionCurrency,
    });

    // The expense-type flags below (`isDistanceRequest`, `isTimeRequest`, ...) are temporary: once this component
    // forks per expense type, each variant knows its own type and they leave both the provider and the context.
    const listFooterContent = (
        <ConfirmationFieldsProvider
            transactionID={transactionID}
            reportID={reportID}
            reportActionID={reportActionID}
            action={action}
            iouType={iouType}
            policyID={policyID}
            isReadOnly={isReadOnly}
            didConfirm={!!didConfirm}
            isEditingSplitBill={isEditingSplitBill}
            canEnterScanFieldsManually={canEnterScanFieldsManually}
            isPolicyExpenseChat={isPolicyExpenseChat}
            isScanRequest={isScanRequest}
            isDistanceRequest={isDistanceRequest}
            isPerDiemRequest={isPerDiemRequest}
            isTimeRequest={isTimeRequest}
            isTypeInvoice={isTypeInvoice}
            isManualDistanceRequest={isManualDistanceRequest}
            isOdometerDistanceRequest={isOdometerDistanceRequest}
            isGPSDistanceRequest={isGPSDistanceRequest}
            scrollFocusedInputIntoView={scrollFocusedInputIntoView}
            onSubmitForm={confirm}
            onTaxAmountEmptyChange={setIsTaxAmountEmpty}
        >
            <View style={isCompactMode ? styles.flex1 : undefined}>
                <MoneyRequestConfirmationListFooter
                    receiptStitchError={receiptStitchError}
                    isCompactMode={isCompactMode}
                    policy={policy}
                    policyTags={policyTags}
                    selectedParticipants={selectedParticipantsProp}
                    distanceData={{
                        distance,
                        hasRoute,
                        unit,
                        distanceRateName: mileageRate.name,
                        distanceRateCurrency: currency,
                        mileageRate,
                        expenseDate: getCreated(transaction),
                        customUnitRateID,
                        shouldShowRateAutoUpdatedTooltip,
                        customUnit: transaction?.comment?.customUnit,
                    }}
                    amountDisplay={amountDisplay}
                    requiredFlags={requiredFlags}
                    visibilityFlags={{...visibilityFlags, isParticipantPickerVisible}}
                    errorState={errorState}
                    toggleHandlers={{onToggleReimbursable, onToggleBillable}}
                    receiptOptions={{
                        receiptFilename,
                        receiptPath,
                        isLoadingReceipt,
                        isReceiptEditable,
                        shouldDisplayReceipt,
                        onPDFLoadError,
                        onPDFPassword,
                    }}
                    compactControls={compactControls}
                />
            </View>
        </ConfirmationFieldsProvider>
    );

    return (
        <>
            <ConfirmationTelemetry transactionID={transactionID} />
            <TaxController
                transactionID={transactionID}
                policyID={policyID}
                isReadOnly={isReadOnly}
                shouldShowTax={shouldShowTax}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                defaultTaxCode={defaultTaxCode}
                defaultTaxValue={defaultTaxValue}
                shouldKeepCurrentTaxSelection={shouldKeepCurrentTaxSelection}
                taxAmountInSmallestCurrencyUnits={taxAmountInSmallestCurrencyUnits}
                transactionTaxAmount={transaction?.taxAmount}
            />
            <DistanceRequestController
                transactionID={transactionID}
                transaction={transaction}
                isDistanceRequest={isDistanceRequest}
                isManualDistanceRequest={isManualDistanceRequest}
                isPolicyExpenseChat={isPolicyExpenseChat}
                customUnitRateID={customUnitRateID}
                mileageRate={mileageRate}
                distance={distance}
                unit={unit}
                rate={rate}
                currency={currency}
                policy={policy}
                isReadOnly={isReadOnly}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                isTypeSplit={isTypeSplit}
                selectedParticipants={selectedParticipants}
                selectedParticipantsProp={selectedParticipantsProp}
                defaultMileageRateCustomUnitRateID={defaultRate}
                hasRoute={hasRoute}
                isDistanceRequestWithPendingRoute={isDistanceRequestWithPendingRoute}
                shouldCalculateDistanceAmount={shouldCalculateDistanceAmount}
                distanceRequestAmount={distanceRequestAmount}
                currentUserAccountID={currentUserAccountID}
                setFormError={setFormError}
                clearFormErrors={clearFormErrors}
            />
            <SplitBillController
                transaction={transaction}
                isTypeSplit={isTypeSplit}
                iouAmount={iouAmount}
                iouCurrencyCode={iouCurrencyCode}
                currentUserAccountID={currentUserAccountID}
                isFocused={isFocused}
                onFormError={setFormError}
            />
            <FieldAutoSelector
                transactionID={transactionID}
                transaction={transaction}
                policyCategories={policyCategories}
                policyTagLists={policyTagLists}
                policyTags={policyTags}
                policy={policy}
                shouldShowCategories={shouldShowCategories}
                isCategoryRequired={isCategoryRequired}
                iouCategory={iouCategory}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
            />
            <ConfirmationListLayout
                sections={sections}
                listRef={listRef}
                footerContent={footerContent}
                listFooterContent={listFooterContent}
                isCompactMode={isCompactMode}
                onSelectRow={navigateToParticipantPage}
                onDismissError={dismissParticipantRowError}
            />
        </>
    );
}

export default MoneyRequestConfirmationList;
