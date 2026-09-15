import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {adjustRemainingSplitShares} from '@libs/actions/IOU/Split';

import type {SplitShares} from '@src/types/onyx/Transaction';

import {useEffect} from 'react';

import {useConfirmationData} from './ConfirmationDataContext';

/**
 * Side-effect-only component that validates split share amounts
 * and adjusts remaining split shares when the transaction changes.
 *
 * Mounted only by the variants whose expense type can be split.
 */
function SplitBillController() {
    const {transaction, isTypeSplit, iouAmount, iouCurrencyCode, currentUserAccountID, isFocused, setFormError: onFormError} = useConfirmationData();
    const {translate} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();

    useEffect(() => {
        if (!isTypeSplit || !transaction?.splitShares || !isFocused) {
            return;
        }

        const splitSharesMap: SplitShares = transaction.splitShares;
        const shares: number[] = Object.values(splitSharesMap).map((splitShare) => splitShare?.amount ?? 0);
        const sumOfShares = shares?.reduce((prev, current): number => prev + current, 0);
        if (sumOfShares !== iouAmount) {
            onFormError('iou.error.invalidSplit');
            return;
        }

        const participantsWithAmount = Object.keys(transaction?.splitShares ?? {})
            .filter((accountID: string): boolean => (transaction?.splitShares?.[Number(accountID)]?.amount ?? 0) > 0)
            .map((accountID) => Number(accountID));

        // A split must have at least two participants with amounts bigger than 0
        if (participantsWithAmount.length === 1) {
            onFormError('iou.error.invalidSplitParticipants');
            return;
        }

        // Amounts should be bigger than 0 for the split bill creator (yourself)
        if (transaction?.splitShares[currentUserAccountID] && (transaction.splitShares[currentUserAccountID]?.amount ?? 0) === 0) {
            onFormError('iou.error.invalidSplitYourself');
            return;
        }

        onFormError('');
    }, [isFocused, transaction, isTypeSplit, transaction?.splitShares, currentUserAccountID, iouAmount, iouCurrencyCode, onFormError, translate]);

    useEffect(() => {
        if (!isTypeSplit || !transaction?.splitShares) {
            return;
        }
        adjustRemainingSplitShares(transaction, getCurrencyDecimals);
    }, [isTypeSplit, transaction, getCurrencyDecimals]);

    return null;
}

SplitBillController.displayName = 'SplitBillController';

export default SplitBillController;
