import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import PerDiemDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/TransactionDetailsFields/PerDiemDetailsFields';
import PerDiemSection from '@components/MoneyRequestConfirmationListFooter/sections/PerDiemSection';
import type {MoneyRequestConfirmationListFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import usePermissions from '@hooks/usePermissions';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type PerDiemFooterProps = Omit<
    MoneyRequestConfirmationListFooterProps,
    'receiptStitchError' | 'receiptOptions' | 'isScanRequest' | 'compactControls' | 'isEditingSplitBill' | 'expenseMode' | 'distanceFlags' | 'distanceData'
>;

function PerDiemFooter({
    action,
    iouType,
    transactionID,
    reportID,
    reportActionID,
    policyID,
    policy,
    policyTags,
    selectedParticipants,
    isReadOnly,
    didConfirm,
    isPolicyExpenseChat,
    amountDisplay,
    requiredFlags,
    visibilityFlags,
    errorState,
    toggleHandlers = {},
    scrollFocusedInputIntoView,
    onSubmitForm,
    onTaxAmountEmptyChange,
}: PerDiemFooterProps) {
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);

    const renderTransactionDetailsFields = () => (
        <PerDiemDetailsFields
            policy={policy}
            isDescriptionRequired={requiredFlags.isDescriptionRequired}
        />
    );

    return (
        <ConfirmationFieldsProvider
            transactionID={transactionID}
            reportID={reportID}
            reportActionID={reportActionID}
            action={action}
            iouType={iouType}
            policyID={policyID}
            isReadOnly={isReadOnly}
            didConfirm={didConfirm}
            isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
            isPolicyExpenseChat={isPolicyExpenseChat}
            isPerDiemRequest
            scrollFocusedInputIntoView={scrollFocusedInputIntoView}
            onSubmitForm={onSubmitForm}
            onTaxAmountEmptyChange={onTaxAmountEmptyChange}
        >
            <View>
                <PerDiemSection
                    policy={policy}
                    shouldDisplayFieldError={errorState.shouldDisplayFieldError}
                    formError={errorState.formError}
                />
                <ConfirmationFieldList
                    policy={policy}
                    policyTags={policyTags}
                    selectedParticipants={selectedParticipants}
                    amountDisplay={amountDisplay}
                    requiredFlags={requiredFlags}
                    visibilityFlags={visibilityFlags}
                    errorState={errorState}
                    toggleHandlers={toggleHandlers}
                    renderTransactionDetailsFields={renderTransactionDetailsFields}
                />
            </View>
        </ConfirmationFieldsProvider>
    );
}

export default PerDiemFooter;
