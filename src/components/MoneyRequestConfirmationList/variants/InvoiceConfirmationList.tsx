import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import useTaxAmount from '@components/MoneyRequestConfirmationList/hooks/useTaxAmount';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {InvoiceConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import InvoiceFooter from '@components/MoneyRequestConfirmationListFooter/variants/InvoiceFooter';

import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

/**
 * Confirms an invoice.
 *
 * An invoice is always a manual expense — the request-type tabs are not offered for it — so this mounts neither
 * the distance state nor its controller, and never enters the compact layout. It is also never a split, so it
 * skips the split controller. `InvoiceFooter` adds the sender row above the shared fields.
 */
function InvoiceConfirmationList({
    transaction,
    onConfirm,
    onOpenParticipantPicker,
    isParticipantPickerVisible = false,
    isLoadingReceipt = false,
    isPolicyExpenseChat = false,
    shouldShowSmartScanFields = true,
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
}: InvoiceConfirmationListProps) {
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
        iouCategory,
        customUnitRateID,
        previousTransactionCurrency,
        isCategoryRequired,
        isMovingTransactionFromTrackExpense,
        shouldShowCategories,
        shouldShowTax,
        setIsTaxAmountEmpty,
    } = useConfirmationListData({
        transaction,
        action,
        iouType: CONST.IOU.TYPE.INVOICE,
        policyID,
        reportID,
        reportActionID,
        selectedParticipants: selectedParticipantsProp,
        payeePersonalDetails: payeePersonalDetailsProp,
        isReadOnly,
        isPolicyExpenseChat,
        expensesNumber,
        receiptPath,
        isConfirmed,
        isConfirming,
        shouldShowSmartScanFields,
        shouldHideToSection,
        isLoadingReceipt,
        onConfirm,
        onOpenParticipantPicker,
        showRemoveExpenseConfirmModal,
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
            isTypeInvoice
            onTaxAmountEmptyChange={setIsTaxAmountEmpty}
        >
            <View>
                <InvoiceFooter
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

export default InvoiceConfirmationList;
