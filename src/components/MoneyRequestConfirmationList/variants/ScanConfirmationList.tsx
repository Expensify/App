import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData, {INLINE_FIELD_ERROR_KEYS} from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import ScanFooter from '@components/MoneyRequestConfirmationListFooter/variants/ScanFooter';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';

import {hasAnyManuallyEnteredScanField} from '@libs/TransactionUtils';

import React, {useState} from 'react';

/**
 * Confirms a scanned expense. The only variant that reaches the compact layout, where the receipt fills the
 * screen and the optional fields collapse behind a show-more button, so it owns that state.
 */
function ScanConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {transaction, canEnterScanFieldsManually = false} = props;

    const isInLandscapeMode = useIsInLandscapeMode();

    const data = useConfirmationListData(props);
    const {transactionID} = data.layoutProps;

    // Multi-scan switches between expenses on the same list, so remember which ones have their fields revealed
    // instead of holding one flag for the whole surface; an expense the user opened stays open when they come back.
    const [revealedTransactionIDs, setRevealedTransactionIDs] = useState<string[]>([]);
    const showMoreFields = !!transactionID && revealedTransactionIDs.includes(transactionID);
    const setShowMoreFields = (shouldShowMoreFields: boolean) => {
        if (!transactionID) {
            return;
        }
        setRevealedTransactionIDs((previousIDs) => {
            if (previousIDs.includes(transactionID) === shouldShowMoreFields) {
                return previousIDs;
            }
            return shouldShowMoreFields ? [...previousIDs, transactionID] : previousIDs.filter((id) => id !== transactionID);
        });
    };

    // Reveal the collapsed fields when the user already filled one of them in, so those values aren't hidden behind
    // "Show more", or when one of them raises an inline error, or opening the section and pressing Create looks like
    // it did nothing. Done during render so the expense never paints collapsed first and it survives a remount.
    const hasManuallyEnteredFields = canEnterScanFieldsManually && hasAnyManuallyEnteredScanField(transaction);
    if (transactionID && !showMoreFields && (hasManuallyEnteredFields || INLINE_FIELD_ERROR_KEYS.has(data.footerProps.errorState.formError))) {
        setRevealedTransactionIDs([...revealedTransactionIDs, transactionID]);
    }

    const isCompactMode = !showMoreFields && !isInLandscapeMode;

    return (
        <ConfirmationListLayout
            {...data.layoutProps}
            fieldFlags={{isScanRequest: true}}
            isCompactMode={isCompactMode}
            listFooterContent={
                <ScanFooter
                    {...data.footerProps}
                    isCompactMode={isCompactMode}
                    compactControls={{showMoreFields, setShowMoreFields}}
                />
            }
        >
            <TaxController {...data.taxControllerProps} />
            <SplitBillController {...data.splitBillControllerProps} />
            <FieldAutoSelector {...data.fieldAutoSelectProps} />
        </ConfirmationListLayout>
    );
}

export default ScanConfirmationList;
