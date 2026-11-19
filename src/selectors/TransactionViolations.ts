import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

const transactionViolationsByIDsSelector =
    (transactionIDs: string[]) =>
    (allViolations: OnyxCollection<TransactionViolations>): OnyxCollection<TransactionViolations> => {
        const result: OnyxCollection<TransactionViolations> = {};
        for (const transactionID of transactionIDs) {
            const key = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}` as const;
            result[key] = allViolations?.[key];
        }
        return result;
    };

/**
 * Keeps only the violation lists that flag an auto-reported rejected expense. That's the only violation `hasOutstandingChildRequest`
 * reads for the sibling reports of a chat, so rows that only subscribe to their own transactions' violations can still pass it along
 * without re-rendering on unrelated violation changes.
 */
const autoReportedRejectedExpenseViolationsSelector = (allViolations: OnyxCollection<TransactionViolations>): OnyxCollection<TransactionViolations> => {
    const result: OnyxCollection<TransactionViolations> = {};
    for (const [key, violations] of Object.entries(allViolations ?? {})) {
        if (!violations?.some((violation) => violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)) {
            continue;
        }
        result[key] = violations;
    }
    return result;
};

export {transactionViolationsByIDsSelector, autoReportedRejectedExpenseViolationsSelector};
