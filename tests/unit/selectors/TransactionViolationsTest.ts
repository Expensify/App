import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {autoReportedRejectedExpenseViolationsSelector} from '@selectors/TransactionViolations';

describe('autoReportedRejectedExpenseViolationsSelector', () => {
    it('keeps only the violation lists that contain an auto-reported rejected expense violation', () => {
        // Given one transaction flagged as an auto-reported rejected expense (alongside another violation), one with an unrelated violation and one without any
        const rejectedViolations: TransactionViolations = [
            {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
            {name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE, type: CONST.VIOLATION_TYPES.WARNING},
        ];
        const allViolations: OnyxCollection<TransactionViolations> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1`]: rejectedViolations,
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}2`]: [{name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.WARNING}],
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}3`]: [],
        };

        // When selecting the auto-reported rejected expense violations
        const result = autoReportedRejectedExpenseViolationsSelector(allViolations);

        // Then only the flagged transaction's full violation list is kept, since hasOutstandingChildRequest only needs that violation for sibling reports
        expect(result).toEqual({[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1`]: rejectedViolations});
    });

    it('returns an empty collection when the violations collection is not loaded', () => {
        // Given the violations collection hasn't loaded yet
        const allViolations: OnyxCollection<TransactionViolations> = undefined;

        // When selecting the auto-reported rejected expense violations
        const result = autoReportedRejectedExpenseViolationsSelector(allViolations);

        // Then an empty collection is returned so callers can safely spread it
        expect(result).toEqual({});
    });
});
