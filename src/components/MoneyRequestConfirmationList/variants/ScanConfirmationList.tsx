import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import useTaxAmount from '@components/MoneyRequestConfirmationList/hooks/useTaxAmount';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {ScanConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import ScanFooter from '@components/MoneyRequestConfirmationListFooter/variants/ScanFooter';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCurrency, hasValidModifiedAmount} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

/**
 * The errors the amount / merchant / date fields render inline rather than in the footer. Compact mode keeps those
 * fields behind "Show more", so raising one has to reveal them or pressing Create looks like it did nothing.
 */
const INLINE_FIELD_ERROR_KEYS = new Set<TranslationPaths | ''>(['common.error.fieldRequired', 'common.error.invalidAmount', 'iou.error.invalidMerchant']);

/**
 * Confirms a scanned expense. The only variant that reaches the compact layout, where the receipt fills the
 * screen and the optional fields collapse behind a show-more button.
 *
 * A scan is never a distance request, so this mounts neither the distance state nor its controller. It keeps the
 * tax controller: `useTaxAmount` reads `distance` only inside its distance branches, so the taxable amount comes
 * from the transaction amount here.
 */
function ScanConfirmationList({
    transaction,
    onSendMoney,
    onConfirm,
    onOpenParticipantPicker,
    isParticipantPickerVisible = false,
    iouType = CONST.IOU.TYPE.SUBMIT,
    isLoadingReceipt = false,
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
    shouldHideToSection = false,
}: ScanConfirmationListProps) {
    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();

    const iouAmount = hasValidModifiedAmount(transaction) ? Number(transaction?.modifiedAmount) : (transaction?.amount ?? 0);
    const iouCurrencyCode = getCurrency(transaction);

    const {policyForMovingExpenses} = usePolicyForMovingExpenses();

    const [showMoreFields, setShowMoreFields] = useState(false);

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

    // Reveal the collapsed fields when one of them raises an inline error, or opening the section and pressing
    // Create looks like it did nothing. Done during render so it survives the remount a multi-scan switch causes.
    if (INLINE_FIELD_ERROR_KEYS.has(errorState.formError) && !showMoreFields) {
        setShowMoreFields(true);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowMoreFields(false);
    }, [transactionID]);

    const isCompactMode = !showMoreFields && !isInLandscapeMode;

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...confirmationFieldsProviderProps}
            isEditingSplitBill={isEditingSplitBill}
            isScanRequest
            onTaxAmountEmptyChange={setIsTaxAmountEmpty}
        >
            <View style={isCompactMode ? styles.flex1 : undefined}>
                <ScanFooter
                    isCompactMode={isCompactMode}
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
                    compactControls={{showMoreFields, setShowMoreFields}}
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
                isCompactMode={isCompactMode}
                onSelectRow={navigateToParticipantPage}
                onDismissError={dismissParticipantRowError}
            />
        </>
    );
}

export default ScanConfirmationList;
