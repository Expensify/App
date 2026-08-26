import FormHelpMessage from '@components/FormHelpMessage';
import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import DistanceMapSection from '@components/MoneyRequestConfirmationListFooter/sections/DistanceMapSection';
import InvoiceSenderSection from '@components/MoneyRequestConfirmationListFooter/sections/InvoiceSenderSection';
import PerDiemSection from '@components/MoneyRequestConfirmationListFooter/sections/PerDiemSection';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {MoneyRequestConfirmationListFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

const noopSetShowMoreFields = () => {};

/**
 * Fallback footer that renders every section for every expense type, exactly as the single footer
 * component did before the split. Each expense type migrates to its own variant one PR at a time;
 * this stays as the dispatcher's fallback until the last one lands, then it is deleted.
 */
function DefaultFooter({
    action,
    iouType,
    transactionID,
    reportID,
    receiptStitchError,
    reportActionID,
    isScanRequest,
    policyID,
    policy,
    policyTags,
    selectedParticipants,
    isReadOnly,
    didConfirm,
    isEditingSplitBill = false,
    isPolicyExpenseChat,
    expenseMode,
    distanceFlags,
    distanceData,
    amountDisplay,
    requiredFlags,
    visibilityFlags,
    errorState,
    toggleHandlers,
    receiptOptions,
    compactControls,
    scrollFocusedInputIntoView,
    onSubmitForm,
    onTaxAmountEmptyChange,
}: MoneyRequestConfirmationListFooterProps) {
    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);

    const showMoreFields = compactControls?.showMoreFields ?? false;
    const setShowMoreFields = compactControls?.setShowMoreFields ?? noopSetShowMoreFields;
    const isCompactMode = !showMoreFields && isScanRequest && !isInLandscapeMode;

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
            isEditingSplitBill={isEditingSplitBill}
            isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
            isPolicyExpenseChat={isPolicyExpenseChat}
            isDistanceRequest={expenseMode.isDistance}
            isTimeRequest={expenseMode.isTime}
            isTypeInvoice={expenseMode.isInvoice}
            isManualDistanceRequest={distanceFlags.isManualDistanceRequest}
            isOdometerDistanceRequest={distanceFlags.isOdometerDistanceRequest}
            isGPSDistanceRequest={distanceFlags.isGPSDistanceRequest}
            scrollFocusedInputIntoView={scrollFocusedInputIntoView}
            onSubmitForm={onSubmitForm}
            onTaxAmountEmptyChange={onTaxAmountEmptyChange}
        >
            <View style={isCompactMode ? styles.flex1 : undefined}>
                <View>
                    <InvoiceSenderSection selectedParticipants={selectedParticipants} />
                    <DistanceMapSection />
                </View>

                <ReceiptSection
                    policy={policy}
                    isReceiptEditable={receiptOptions.isReceiptEditable ?? false}
                    shouldDisplayReceipt={receiptOptions.shouldDisplayReceipt}
                    isLoadingReceipt={receiptOptions.isLoadingReceipt ?? false}
                    receiptPath={receiptOptions.receiptPath}
                    receiptFilename={receiptOptions.receiptFilename}
                    showMoreFields={showMoreFields}
                    onPDFLoadError={receiptOptions.onPDFLoadError}
                    onPDFPassword={receiptOptions.onPDFPassword}
                />

                {!!receiptStitchError && (
                    <View style={styles.mh5}>
                        <FormHelpMessage message={receiptStitchError} />
                    </View>
                )}

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
                    compactState={{isCompactMode, setShowMoreFields}}
                />
            </View>
        </ConfirmationFieldsProvider>
    );
}

export default DefaultFooter;
