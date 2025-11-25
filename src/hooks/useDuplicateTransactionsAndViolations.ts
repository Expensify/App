import {useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolations} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Selects violations related to provided transaction IDs and if present, the violations of their duplicates.
 * @param transactionIDs - An array of transaction IDs to fetch their violations for.
 * @param allTransactionsViolations - A collection of all transaction violations currently in the onyx db.
 * @returns - A collection of violations related to the transaction IDs and if present, the violations of their duplicates.
 * @private
 */
function selectViolationsWithDuplicates(transactionIDs: string[], allTransactionsViolations: OnyxCollection<TransactionViolations>): OnyxCollection<TransactionViolations> {
    if (!allTransactionsViolations || !transactionIDs?.length) {
        return {};
    }

    const result: OnyxCollection<TransactionViolations> = {};

    for (const transactionID of transactionIDs) {
        const key = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
        const transactionViolations = allTransactionsViolations[key];

        if (!transactionViolations) {
            continue;
        }

        result[key] = transactionViolations;

        transactionViolations
            .filter((violations) => violations.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)
            .flatMap((violations) => violations?.data?.duplicates ?? [])
            // eslint-disable-next-line unicorn/no-array-for-each
            .forEach((duplicateID) => {
                if (!duplicateID) {
                    return;
                }

                const duplicateKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicateID}`;
                const duplicateViolations = allTransactionsViolations[duplicateKey];

                if (duplicateViolations) {
                    result[duplicateKey] = duplicateViolations;
                }
            });
    }

    return result;
}

/**
 * Selects transactions related to provided transaction IDs and if present, the duplicate transactions.
 * @param transactionIDs - An array of transaction IDs to fetch their transactions for.
 * @param allTransactions - A collection of all transactions currently in the onyx.
 * @param duplicateTransactionViolations - A collection of all duplicate transaction violations currently in the onyx.
 * @returns - A collection of transactions related to the transaction IDs and if present, the duplicate transactions.
 */

function selectTransactionsWithDuplicates(
    transactionIDs: string[],
    allTransactions: OnyxCollection<Transaction>,
    duplicateTransactionViolations: OnyxCollection<TransactionViolations>,
): OnyxCollection<Transaction> {
    if (!allTransactions) {
        return {};
    }

    const result: OnyxCollection<Transaction> = {};

    for (const transactionID of transactionIDs) {
        const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
        const transaction = allTransactions[key];
        if (transaction) {
            result[key] = transaction;
        }

        const transactionViolations = duplicateTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];

        if (!transactionViolations) {
            continue;
        }

        transactionViolations
            .filter((violations) => violations.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)
            .flatMap((violations) => violations?.data?.duplicates ?? [])
            // eslint-disable-next-line unicorn/no-array-for-each
            .forEach((duplicateID) => {
                if (!duplicateID) {
                    return;
                }

                const duplicateKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${duplicateID}`;
                const duplicateTransaction = allTransactions[duplicateKey];

                if (duplicateTransaction) {
                    result[duplicateKey] = duplicateTransaction;
                }
            });
    }
    return result;
}

type DuplicateTransactionsAndViolations = {
    duplicateTransactions: OnyxCollection<Transaction>;
    duplicateTransactionViolations: OnyxCollection<TransactionViolations>;
};

/**
 * A hook to fetch transactions, their violations and if present, the duplicate transactions and their violations.
 * @param transactionIDs - Array of transaction IDs to check for duplicates.
 * @returns - An object containing duplicate transactions and their violations.
 */
function useDuplicateTransactionsAndViolations(transactionIDs: string[]): DuplicateTransactionsAndViolations {
    const violationsSelectorMemo = useMemo(() => {
        return (allTransactionsViolations: OnyxCollection<TransactionViolations>) => selectViolationsWithDuplicates(transactionIDs, allTransactionsViolations);
    }, [transactionIDs]);

    const [duplicateTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        canBeMissing: true,
        selector: violationsSelectorMemo,
    });

    const transactionSelector = useMemo(() => {
        return (allTransactions: OnyxCollection<Transaction>) => selectTransactionsWithDuplicates(transactionIDs, allTransactions, duplicateTransactionViolations);
    }, [transactionIDs, duplicateTransactionViolations]);

    const [duplicateTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        canBeMissing: true,
        selector: transactionSelector,
    });

    return useMemo(
        () => ({
            duplicateTransactions,
            duplicateTransactionViolations,
        }),
        [duplicateTransactions, duplicateTransactionViolations],
    );
}

export default useDuplicateTransactionsAndViolations;
