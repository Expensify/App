import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import ConfirmationTelemetry from '@components/MoneyRequestConfirmationList/ConfirmationTelemetry';
import DistanceRequestController from '@components/MoneyRequestConfirmationList/DistanceRequestController';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import useDistanceRequestState from '@components/MoneyRequestConfirmationList/hooks/useDistanceRequestState';
import useTaxAmount from '@components/MoneyRequestConfirmationList/hooks/useTaxAmount';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
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

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

/**
 * Confirms every expense type, by branching at runtime on which type it was handed.
 *
 * This is the body the per-type variants are being carved out of, and it shrinks as each one lands: a type that
 * has its own variant no longer reaches here. It goes away once the last variant is extracted.
 */
function DefaultConfirmationList({
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

export default DefaultConfirmationList;
