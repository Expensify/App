import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import TimeDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/TransactionDetailsFields/TimeDetailsFields';
import type {DetailsFieldsProps} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {TimeFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import usePermissions from '@hooks/usePermissions';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

function TimeFooter({
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
    toggleHandlers,
    receiptOptions,
    scrollFocusedInputIntoView,
    onSubmitForm,
    onTaxAmountEmptyChange,
}: TimeFooterProps) {
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);

    const renderTransactionDetailsFields = (detailsProps: DetailsFieldsProps) => (
        <TimeDetailsFields
            {...detailsProps}
            policy={policy}
            amountDisplay={amountDisplay}
            isDescriptionRequired={requiredFlags.isDescriptionRequired}
            errorState={errorState}
            isParticipantPickerVisible={visibilityFlags.isParticipantPickerVisible}
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
            isTimeRequest
            scrollFocusedInputIntoView={scrollFocusedInputIntoView}
            onSubmitForm={onSubmitForm}
            onTaxAmountEmptyChange={onTaxAmountEmptyChange}
        >
            <View>
                <ReceiptSection
                    policy={policy}
                    {...receiptOptions}
                />
                <ConfirmationFieldList
                    policy={policy}
                    policyTags={policyTags}
                    selectedParticipants={selectedParticipants}
                    amountDisplay={amountDisplay}
                    requiredFlags={requiredFlags}
                    visibilityFlags={visibilityFlags}
                    errorState={errorState}
                    toggleHandlers={toggleHandlers ?? {}}
                    renderTransactionDetailsFields={renderTransactionDetailsFields}
                />
            </View>
        </ConfirmationFieldsProvider>
    );
}

export default TimeFooter;
