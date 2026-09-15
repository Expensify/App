import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import type {PerDiemConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import PerDiemFooter from '@components/MoneyRequestConfirmationListFooter/variants/PerDiemFooter';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

/**
 * Confirms a per-diem expense.
 *
 * Per diem shows no receipt, is never a distance or scan request, and never enters the compact layout, so this
 * mounts neither the distance state nor its controller. It skips the tax controller too: `isTaxTrackingEnabled`
 * returns false for per diem, so the tax field can never be shown here.
 */
function PerDiemConfirmationList({
    transaction,
    onConfirm,
    iouType = CONST.IOU.TYPE.SUBMIT,
    isPolicyExpenseChat = false,
    shouldShowSmartScanFields = true,
    canEnterScanFieldsManually = false,
    selectedParticipants: selectedParticipantsProp,
    payeePersonalDetails: payeePersonalDetailsProp,
    isReadOnly = false,
    policyID,
    reportID = '',
    onToggleBillable,
    reportActionID,
    action = CONST.IOU.ACTION.CREATE,
    expensesNumber = 0,
    isConfirmed,
    isConfirming,
    onToggleReimbursable,
    showRemoveExpenseConfirmModal,
    shouldHideToSection = false,
}: PerDiemConfirmationListProps) {
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
        isCategoryRequired,
        isMovingTransactionFromTrackExpense,
        shouldShowCategories,
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
        expensesNumber,
        isConfirmed,
        isConfirming,
        shouldShowSmartScanFields,
        canEnterScanFieldsManually,
        shouldHideToSection,
        onConfirm,
        showRemoveExpenseConfirmModal,
        isPerDiemRequest: true,
    });

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...confirmationFieldsProviderProps}
            isPerDiemRequest
        >
            <View>
                <PerDiemFooter
                    policy={policy}
                    policyTags={policyTags}
                    selectedParticipants={selectedParticipantsProp}
                    amountDisplay={amountDisplay}
                    requiredFlags={requiredFlags}
                    visibilityFlags={visibilityFlags}
                    errorState={errorState}
                    toggleHandlers={{onToggleReimbursable, onToggleBillable}}
                />
            </View>
        </ConfirmationFieldsProvider>
    );

    return (
        <>
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

export default PerDiemConfirmationList;
