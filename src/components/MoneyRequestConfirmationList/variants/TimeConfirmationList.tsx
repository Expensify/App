import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import type {TimeConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import TimeFooter from '@components/MoneyRequestConfirmationListFooter/variants/TimeFooter';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

/**
 * Confirms a time expense being created.
 *
 * A time expense is never a distance or scan request and never enters the compact layout, so this mounts neither
 * the distance state nor its controller. It skips the tax controller too: `isTaxTrackingEnabled` returns false
 * for time, so the tax field can never be shown here.
 *
 * Only the CREATE action reaches this. Outside CREATE a time expense shows Merchant and hides the hours/rate
 * fields, which is what the manual confirmation renders anyway.
 */
function TimeConfirmationList({
    transaction,
    onConfirm,
    iouType = CONST.IOU.TYPE.SUBMIT,
    isLoadingReceipt = false,
    isPolicyExpenseChat = false,
    shouldShowSmartScanFields = true,
    canEnterScanFieldsManually = false,
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
}: TimeConfirmationListProps) {
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
        receiptPath,
        isConfirmed,
        isConfirming,
        shouldShowSmartScanFields,
        canEnterScanFieldsManually,
        shouldHideToSection,
        isLoadingReceipt,
        onConfirm,
        showRemoveExpenseConfirmModal,
        isTimeRequest: true,
    });

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...confirmationFieldsProviderProps}
            isTimeRequest
        >
            <View>
                <TimeFooter
                    policy={policy}
                    policyTags={policyTags}
                    selectedParticipants={selectedParticipantsProp}
                    amountDisplay={amountDisplay}
                    requiredFlags={requiredFlags}
                    visibilityFlags={visibilityFlags}
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

export default TimeConfirmationList;
