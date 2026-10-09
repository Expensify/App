import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePreviousDefined from '@hooks/usePreviousDefined';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import {removeDraftTransaction, replaceDefaultDraftTransaction} from '@userActions/TransactionEdit';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {useState} from 'react';

/**
 * Tracks which of the confirmation's draft transactions is shown, and lets the user page between them or remove one.
 */
function useConfirmationTransactionPager(initialTransaction: OnyxEntry<Transaction>, initialTransactionID: string) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const [transactions] = useOptimisticDraftTransactions(initialTransaction);

    const [currentTransactionID, setCurrentTransactionID] = useState<string>(initialTransactionID);
    const currentTransactionIndex = transactions.findIndex((transaction) => transaction.transactionID === currentTransactionID);
    const [existingTransaction, existingTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(currentTransactionID)}`);
    const [optimisticTransaction, optimisticTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(currentTransactionID)}`);
    const isLoadingCurrentTransaction = isLoadingOnyxValue(existingTransactionResult, optimisticTransactionResult);
    const currentTransaction = !isLoadingCurrentTransaction ? (optimisticTransaction ?? existingTransaction) : undefined;
    // `useOnyx` drops back to a loading state whenever its key changes, so switching between transactions leaves
    // `currentTransaction` undefined for a render. Hold the previous one across that gap: `MoneyRequestConfirmationList`
    // picks its variant from the request type, so an undefined transaction falls to the manual variant and remounts the
    // whole list, losing the state the scan variant holds.
    const lastDefinedTransaction = usePreviousDefined(currentTransaction);
    const transaction = isLoadingCurrentTransaction ? lastDefinedTransaction : currentTransaction;

    const showNextTransaction = () => {
        const nextTransaction = transactions.at(currentTransactionIndex + 1);
        if (nextTransaction) {
            setCurrentTransactionID(nextTransaction.transactionID);
        }
    };

    const showPreviousTransaction = () => {
        const previousTransaction = transactions.at(currentTransactionIndex - 1);
        if (previousTransaction) {
            setCurrentTransactionID(previousTransaction.transactionID);
        }
    };

    const removeCurrentTransaction = () => {
        if (currentTransactionID === CONST.IOU.OPTIMISTIC_TRANSACTION_ID) {
            const nextTransaction = transactions.at(currentTransactionIndex + 1);
            replaceDefaultDraftTransaction(nextTransaction);
            return;
        }

        removeDraftTransaction(currentTransactionID);
        showPreviousTransaction();
    };

    const confirmRemoveCurrentTransaction = async () => {
        const result = await showConfirmModal({
            title: translate('iou.removeExpense'),
            prompt: translate('iou.removeExpenseConfirmation'),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        removeCurrentTransaction();
    };

    return {
        transactions,
        transaction,
        existingTransaction,
        currentTransactionID,
        currentTransactionIndex,
        setCurrentTransactionID,
        showNextTransaction,
        showPreviousTransaction,
        confirmRemoveCurrentTransaction,
    };
}

export default useConfirmationTransactionPager;
