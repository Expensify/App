import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import PerDiemSection from '@components/MoneyRequestConfirmationListFooter/sections/PerDiemSection';
import type {MoneyRequestConfirmationListFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import usePermissions from '@hooks/usePermissions';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type PerDiemFooterProps = Omit<
    MoneyRequestConfirmationListFooterProps,
    'receiptStitchError' | 'receiptOptions' | 'isScanRequest' | 'compactControls' | 'isEditingSplitBill' | 'expenseMode' | 'distanceFlags'
>;

const noopSetShowMoreFields = () => {};

/**
 * Footer for per-diem expenses: the per-diem subrate fields plus the shared field list, and nothing else.
 *
 * The dispatcher keeps `action === SUBMIT` off this variant, so the subrate fields need no gate of their own.
 * Every expense-type flag the provider defaults to `false` is left unset rather than passed explicitly.
 */
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
    distanceData,
    amountDisplay,
    requiredFlags,
    visibilityFlags,
    errorState,
    toggleHandlers,
    scrollFocusedInputIntoView,
    onSubmitForm,
    onTaxAmountEmptyChange,
}: PerDiemFooterProps) {
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);

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
                {/* TODO: Clean up from unused by per diem fields */}
                <ConfirmationFieldList
                    policy={policy}
                    policyTags={policyTags}
                    selectedParticipants={selectedParticipants}
                    distanceData={distanceData}
                    amountDisplay={amountDisplay}
                    requiredFlags={requiredFlags}
                    visibilityFlags={visibilityFlags}
                    errorState={errorState}
                    toggleHandlers={toggleHandlers ?? {}}
                    compactState={{isCompactMode: false, setShowMoreFields: noopSetShowMoreFields}}
                />
            </View>
        </ConfirmationFieldsProvider>
    );
}

export default PerDiemFooter;
