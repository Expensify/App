import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';

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

// eslint-disable-next-line import/prefer-default-export -- this file will include more selectors, so we want don't want to export single selector as default
export {transactionViolationsByIDsSelector};
