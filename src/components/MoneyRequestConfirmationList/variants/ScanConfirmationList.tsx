import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import {hasFieldErrors} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import {isErrorShownOnItsOwnField} from '@components/MoneyRequestConfirmationList/hooks/useFormErrorManagement';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import ScanFooter from '@components/MoneyRequestConfirmationListFooter/variants/ScanFooter';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';

import {hasAnyManuallyEnteredScanField} from '@libs/TransactionUtils';

import type {TranslationPaths} from '@src/languages/types';

import React, {useState} from 'react';

/**
 * Confirms a scanned expense. The only variant that reaches the compact layout, where the receipt fills the
 * screen and the optional fields collapse behind a show-more button, so it owns that state.
 */
function ScanConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {transaction, canEnterScanFieldsManually = false} = props;

    const isInLandscapeMode = useIsInLandscapeMode();

    const data = useConfirmationListData({...props, isScanRequest: true});
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

    // The fields expand during render when they hold a value or an error, so the expense never paints collapsed, even after a remount, and Create never looks like it did nothing.
    const hasManuallyEnteredFields = canEnterScanFieldsManually && hasAnyManuallyEnteredScanField(transaction);
    const {formError, fieldErrors} = data.footerProps.errorState;
    // The attendees and tax amount fields sit behind "Show more". Every receipt shares one form error, so it opens only the receipt on screen when it is raised.
    const [lastFormError, setLastFormError] = useState<TranslationPaths | ''>('');
    const isNewErrorOnCollapsedField = formError !== lastFormError && isErrorShownOnItsOwnField(formError);
    if (formError !== lastFormError) {
        setLastFormError(formError);
    }
    if (transactionID && !showMoreFields && (hasManuallyEnteredFields || hasFieldErrors(fieldErrors) || isNewErrorOnCollapsedField)) {
        setRevealedTransactionIDs([...revealedTransactionIDs, transactionID]);
    }

    const isCompactMode = !showMoreFields && !isInLandscapeMode;

    return (
        <ConfirmationListLayout
            {...data.layoutProps}
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
