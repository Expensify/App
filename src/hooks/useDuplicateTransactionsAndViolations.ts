import ONYXKEYS from "@src/ONYXKEYS";
import { OnyxCollection, useOnyx } from "react-native-onyx";
import type { Transaction, TransactionViolations } from "@src/types/onyx";
import CONST from "@src/CONST";
import { useMemo } from "react";

/**
 * Selects violations related to provided transaction IDs and if present, the violations of their duplicates.
 * @param {string[]} transactionIDs - An array of transaction IDs to fetch their violations for.
 * @param {OnyxCollection<TransactionViolations>} allViolations - A collection of all transaction violations currently in the onyx.
 * @returns {OnyxCollection<TransactionViolations>} - A collection of violations related to the transaction IDs and if present, the violations of their duplicates.
 * @private
 */
function selectViolationsWithDuplicates(
    transactionIDs: string[],
    allViolations: OnyxCollection<TransactionViolations>
): OnyxCollection<TransactionViolations> {
    if (!allViolations) {
        return {};
    }

    const result: OnyxCollection<TransactionViolations> = {};

    for (const transactionID of transactionIDs) {
        const key = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
        const violations = allViolations[key];

        if (!violations) {
            continue;
        }

        result[key] = violations;

        violations
            .filter(violations => violations.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)
            .flatMap(violations => violations?.data?.duplicates ?? [])
            .forEach(duplicateID => {
                if (!duplicateID) {
                    return;
                }

                const duplicateKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicateID}`;
                const duplicateViolations = allViolations[duplicateKey];

                if (duplicateViolations) {
                    result[duplicateKey] = duplicateViolations;
                }
            });
    }

    return result;
}

/**
 * Hook to fetch transactions, their violations and if present, the duplicate transactions and their violations.
 * @param {string[]} transactionIDs - Array of transaction IDs to check for duplicates.
 * @returns {Object} - An object containing duplicate transactions and their violations.
 * @property {OnyxCollection<Transaction>} duplicateTransactions - Collection of duplicate transactions.
 * @property {OnyxCollection<TransactionViolations>} duplicateTransactionViolations - Collection of violations related to duplicate transactions.
 */
function useDuplicateTransactionsAndViolations(transactionIDs: string[]) {
    
    const violationsSelectorMemo = useMemo(() => {
        return (allViolations: OnyxCollection<TransactionViolations>) => selectViolationsWithDuplicates(transactionIDs, allViolations);
    }, [transactionIDs.join(',')]);

    const [duplicateTransactionViolations] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        {
            canBeMissing: true,
            selector: violationsSelectorMemo,
        }
    );
    
    const transactionSelector = useMemo(() => {
        return (allTransactions: OnyxCollection<Transaction>) => {
            if (!allTransactions) {
                return {};
            }

            const result: OnyxCollection<Transaction> = {};

            for (const transactionID of transactionIDs) {
                const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
                const transaction = allTransactions[key];
                if (transaction) result[key] = transaction;

                const violationsKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
                const violations = duplicateTransactionViolations?.[violationsKey];

                if (!violations){
                    continue;
                }

                violations
                    .filter(violations => violations.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)
                    .flatMap(violations => violations?.data?.duplicates ?? [])
                    .forEach(duplicateID => {
                        if (!duplicateID){
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
        };
    }, [transactionIDs.join(','), duplicateTransactionViolations]);

    const [duplicateTransactions] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            canBeMissing: true,
            selector: transactionSelector,
        }
    );

    return useMemo(() => ({
        duplicateTransactions,
        duplicateTransactionViolations,
    }), [duplicateTransactions, duplicateTransactionViolations]);

}

export default useDuplicateTransactionsAndViolations;
