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

    const data = useConfirmationListData(props);
    const revealKey = data.layoutProps.transactionID ?? '';

    // Multi-scan switches between expenses on the same list, so remember which ones have their fields revealed
    // instead of holding one flag for the whole surface; an expense the user opened stays open when they come back.
    const [revealedTransactionIDs, setRevealedTransactionIDs] = useState<string[]>([]);
    const showMoreFields = revealedTransactionIDs.includes(revealKey);
    const setShowMoreFields = (shouldShowMoreFields: boolean) => {
        setRevealedTransactionIDs((previousIDs) => {
            if (previousIDs.includes(revealKey) === shouldShowMoreFields) {
                return previousIDs;
            }
            return shouldShowMoreFields ? [...previousIDs, revealKey] : previousIDs.filter((id) => id !== revealKey);
        });
    };

    // Reveal the collapsed fields when the user already filled one of them in, so those values aren't hidden behind
    // "Show more", or when one of them raises an inline error, or opening the section and pressing Create looks like
    // it did nothing. Done during render so the expense never paints collapsed first and it survives a remount.
    const hasManuallyEnteredFields = canEnterScanFieldsManually && hasAnyManuallyEnteredScanField(transaction);
    if (!showMoreFields && (hasManuallyEnteredFields || INLINE_FIELD_ERROR_KEYS.has(data.errorState.formError))) {
        setRevealedTransactionIDs([...revealedTransactionIDs, revealKey]);
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
