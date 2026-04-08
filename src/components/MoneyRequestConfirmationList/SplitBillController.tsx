import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import {adjustRemainingSplitShares} from '@libs/actions/IOU/Split';
import type {TranslationPaths} from '@src/languages/types';
import type {Transaction} from '@src/types/onyx';
import type {SplitShares} from '@src/types/onyx/Transaction';

type SplitBillControllerProps = {
    transaction: OnyxEntry<Transaction>;
    isTypeSplit: boolean;
    iouAmount: number;
    iouCurrencyCode: string | undefined;
    currentUserAccountID: number;
    isFocused: boolean;
    onFormError: (error: TranslationPaths | '') => void;
};

/**
 * Side-effect-only component that validates split share amounts
 * and adjusts remaining split shares when the transaction changes.
 */
function SplitBillController({transaction, isTypeSplit, iouAmount, iouCurrencyCode, currentUserAccountID, isFocused, onFormError}: SplitBillControllerProps) {
    const {translate} = useLocalize();

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
        adjustRemainingSplitShares(transaction);
    }, [isTypeSplit, transaction]);

    return null;
}

SplitBillController.displayName = 'SplitBillController';

export default SplitBillController;
