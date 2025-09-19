import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';

/**
 * Selects violations related to provided transaction IDs and if present, the violations of their duplicates.
 * @param transactionIDs - An array of transaction IDs to fetch their violations for.
 * @param allTransactionsViolations - A collection of all transaction violations currently in the onyx db.
 * @returns - A collection of violations related to the transaction IDs and if present, the violations of their duplicates.
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
 * Selector factory for getting violations with duplicates for specific transaction IDs
 */
const createViolationsWithDuplicatesSelector = (transactionIDs: string[]) => (allTransactionsViolations: OnyxCollection<TransactionViolations>) =>
    selectViolationsWithDuplicates(transactionIDs, allTransactionsViolations);

export {selectViolationsWithDuplicates, createViolationsWithDuplicatesSelector};
