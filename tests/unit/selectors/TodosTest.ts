import {flaggedExpensesReviewSelector} from '@selectors/Todos';
import type {FlaggedExpensesDerivedValue} from '@src/types/onyx';

describe('flaggedExpensesReviewSelector', () => {
    it('returns count 0 and undefined identifiers when input is undefined', () => {
        const result = flaggedExpensesReviewSelector(undefined);

        expect(result.count).toBe(0);
        expect(result.firstTransactionID).toBeUndefined();
        expect(result.firstReportID).toBeUndefined();
    });

    it('returns count 0 and undefined identifiers when there are no flagged expenses', () => {
        const value: FlaggedExpensesDerivedValue = {flaggedExpenses: []};

        const result = flaggedExpensesReviewSelector(value);

        expect(result.count).toBe(0);
        expect(result.firstTransactionID).toBeUndefined();
        expect(result.firstReportID).toBeUndefined();
    });

    it('returns aggregated count and stable first identifiers for multiple flagged expenses', () => {
        const value: FlaggedExpensesDerivedValue = {
            flaggedExpenses: [
                {transactionID: 't1', reportID: 'r1'},
                {transactionID: 't2', reportID: 'r2'},
                {transactionID: 't3', reportID: 'r3'},
            ],
        };

        const result = flaggedExpensesReviewSelector(value);

        expect(result.count).toBe(3);
        expect(result.firstTransactionID).toBe('t1');
        expect(result.firstReportID).toBe('r1');
    });

    it('returns the same object reference when called twice with shallowly equal values', () => {
        const value: FlaggedExpensesDerivedValue = {
            flaggedExpenses: [{transactionID: 'tA', reportID: 'rA'}],
        };
        const first = flaggedExpensesReviewSelector(value);

        const clone: FlaggedExpensesDerivedValue = {
            flaggedExpenses: [{transactionID: 'tA', reportID: 'rA'}],
        };
        const second = flaggedExpensesReviewSelector(clone);

        expect(second).toBe(first);
    });

    it('returns a new object reference when the first flagged expense changes', () => {
        const value: FlaggedExpensesDerivedValue = {
            flaggedExpenses: [{transactionID: 'tA', reportID: 'rA'}],
        };
        const first = flaggedExpensesReviewSelector(value);

        const changed: FlaggedExpensesDerivedValue = {
            flaggedExpenses: [{transactionID: 'tB', reportID: 'rB'}],
        };
        const second = flaggedExpensesReviewSelector(changed);

        expect(second).not.toBe(first);
        expect(second.firstTransactionID).toBe('tB');
        expect(second.firstReportID).toBe('rB');
    });
});
