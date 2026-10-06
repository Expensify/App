import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationDataContext from '@components/MoneyRequestConfirmationList/ConfirmationDataContext';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData, {INLINE_FIELD_ERROR_KEYS} from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import ScanFooter from '@components/MoneyRequestConfirmationListFooter/variants/ScanFooter';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';

import {hasAnyManuallyEnteredScanField} from '@libs/TransactionUtils';

import React, {useState} from 'react';
import {View} from 'react-native';

/**
 * Confirms a scanned expense. The only variant that reaches the compact layout, where the receipt fills the
 * screen and the optional fields collapse behind a show-more button, so it owns that state.
 */
function ScanConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {
        transaction,
        selectedParticipants,
        isEditingSplitBill,
        isParticipantPickerVisible = false,
        canEnterScanFieldsManually = false,
        onToggleBillable,
        onToggleReimbursable,
        receiptOptions,
    } = props;

    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();

    // An expense whose amount / merchant / date the user already filled in starts expanded, so those values stay
    // on screen when multi-scan brings it back instead of hiding behind "Show more".
    const hasManuallyEnteredFields = canEnterScanFieldsManually && hasAnyManuallyEnteredScanField(transaction);
    const [showMoreFields, setShowMoreFields] = useState(hasManuallyEnteredFields);

    const data = useConfirmationListData(props);
    const {transactionID} = data.layoutProps;

    // Reset the section on a transaction switch, done during render so the new expense never paints collapsed first.
    const [previousTransactionID, setPreviousTransactionID] = useState(transactionID);
    if (previousTransactionID !== transactionID) {
        setPreviousTransactionID(transactionID);
        setShowMoreFields(hasManuallyEnteredFields);
    }

    // Reveal the collapsed fields when one of them raises an inline error, or opening the section and pressing
    // Create looks like it did nothing. Done during render so it survives the remount a multi-scan switch causes.
    if (INLINE_FIELD_ERROR_KEYS.has(data.errorState.formError) && !showMoreFields) {
        setShowMoreFields(true);
    }

    const isCompactMode = !showMoreFields && !isInLandscapeMode;

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...data.confirmationFieldsProviderProps}
            isEditingSplitBill={isEditingSplitBill}
            isScanRequest
            onTaxAmountEmptyChange={data.setIsTaxAmountEmpty}
        >
            <View style={isCompactMode ? styles.flex1 : undefined}>
                <ScanFooter
                    isCompactMode={isCompactMode}
                    policy={data.policy}
                    policyTags={data.policyTags}
                    selectedParticipants={selectedParticipants}
                    amountDisplay={data.amountDisplay}
                    requiredFlags={data.requiredFlags}
                    visibilityFlags={{...data.visibilityFlags, isParticipantPickerVisible}}
                    errorState={data.errorState}
                    toggleHandlers={{onToggleReimbursable, onToggleBillable}}
                    receiptOptions={receiptOptions}
                    compactControls={{showMoreFields, setShowMoreFields}}
                />
            </View>
        </ConfirmationFieldsProvider>
    );

    return (
        <ConfirmationDataContext.Provider value={data}>
            <TaxController />
            <SplitBillController />
            <FieldAutoSelector />
            <ConfirmationListLayout
                {...data.layoutProps}
                isCompactMode={isCompactMode}
                listFooterContent={listFooterContent}
            />
        </ConfirmationDataContext.Provider>
    );
}

export default ScanConfirmationList;
