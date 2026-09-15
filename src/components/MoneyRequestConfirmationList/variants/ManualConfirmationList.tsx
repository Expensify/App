import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import useTaxAmount from '@components/MoneyRequestConfirmationList/hooks/useTaxAmount';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {ManualConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import ManualFooter from '@components/MoneyRequestConfirmationListFooter/variants/ManualFooter';

import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

/**
 * Confirms a manually entered expense, and is the dispatcher's residual case: it also serves pay, per diem being
 * moved off a track expense, and a time expense outside CREATE, all of which confirm as a plain expense. Those
 * last two are why `isPerDiemRequest` and `isTimeRequest` are passed through rather than hardcoded — they still
 * decide whether the amount, merchant and tax fields are shown.
 *
 * A manual expense is never a distance or scan request and never enters the compact layout, so this mounts
 * neither the distance state nor its controller.
 */
function ManualConfirmationList({
    transaction,
    onSendMoney,
    onConfirm,
    onOpenParticipantPicker,
    isParticipantPickerVisible = false,
    iouType = CONST.IOU.TYPE.SUBMIT,
    isLoadingReceipt = false,
    isPerDiemRequest = false,
    isTimeRequest = false,
    isPolicyExpenseChat = false,
    shouldShowSmartScanFields = true,
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
    shouldHideToSection = false,
}: ManualConfirmationListProps) {
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();

    const {
        sections,
        listRef,
        footerContent,
        confirmationFieldsProviderProps,
        navigateToParticipantPage,
        dismissParticipantRowError,
        amountDisplay,
        requiredFlags,
        visibilityFlags,
        errorState,
        policy,
        policyTags,
        policyTagLists,
        policyCategories,
        transactionID,
        iouAmount,
        iouCurrencyCode,
        iouCategory,
        customUnitRateID,
        previousTransactionCurrency,
        currentUserAccountID,
        isTypeSplit,
        isCategoryRequired,
        isFocused,
        isMovingTransactionFromTrackExpense,
        shouldShowCategories,
        shouldShowTax,
        setFormError,
        setIsTaxAmountEmpty,
    } = useConfirmationListData({
        transaction,
        action,
        iouType,
        policyID,
        reportID,
        reportActionID,
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
        shouldHideToSection,
        isLoadingReceipt,
        onConfirm,
        onSendMoney,
        onOpenParticipantPicker,
        showRemoveExpenseConfirmModal,
        isPerDiemRequest,
        isTimeRequest,
    });

    const {defaultTaxCode, defaultTaxValue, shouldKeepCurrentTaxSelection, taxAmountInSmallestCurrencyUnits} = useTaxAmount({
        transaction,
        policy,
        policyForMovingExpenses,
        isDistanceRequest: false,
        isMovingTransactionFromTrackExpense,
        customUnitRateID,
        distance: 0,
        distanceUnit: undefined,
        previousTransactionCurrency,
    });

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...confirmationFieldsProviderProps}
            isEditingSplitBill={isEditingSplitBill}
            isPerDiemRequest={isPerDiemRequest}
            isTimeRequest={isTimeRequest}
            onTaxAmountEmptyChange={setIsTaxAmountEmpty}
        >
            <View>
                <ManualFooter
                    policy={policy}
                    policyTags={policyTags}
                    selectedParticipants={selectedParticipantsProp}
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
                />
            </View>
        </ConfirmationFieldsProvider>
    );

    return (
        <>
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
                transactionID={transactionID}
                sections={sections}
                listRef={listRef}
                footerContent={footerContent}
                listFooterContent={listFooterContent}
                onSelectRow={navigateToParticipantPage}
                onDismissError={dismissParticipantRowError}
            />
        </>
    );
}

export default ManualConfirmationList;
