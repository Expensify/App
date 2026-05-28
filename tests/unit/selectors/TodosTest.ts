import todosReportCountsSelector, {flaggedExpensesReviewSelector, todosSingleReportIDsSelector} from '@selectors/Todos';
import CONST from '@src/CONST';
import type {FlaggedExpensesDerivedValue, TodosDerivedValue} from '@src/types/onyx';

describe('todosReportCountsSelector', () => {
    it('returns undefined when todos is undefined', () => {
        const result = todosReportCountsSelector(undefined);

        expect(result).toBeUndefined();
    });

    it('returns correct counts when all report arrays are populated', () => {
        const todos: TodosDerivedValue = {
            reportsToSubmit: [{reportID: '1'}, {reportID: '2'}, {reportID: '3'}] as TodosDerivedValue['reportsToSubmit'],
            reportsToApprove: [{reportID: '4'}, {reportID: '5'}] as TodosDerivedValue['reportsToApprove'],
            reportsToPay: [{reportID: '6'}] as TodosDerivedValue['reportsToPay'],
            reportsToExport: [{reportID: '7'}, {reportID: '8'}, {reportID: '9'}, {reportID: '10'}] as TodosDerivedValue['reportsToExport'],
            transactionsByReportID: {},
        };

        const result = todosReportCountsSelector(todos);

        expect(result).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: 3,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 2,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: 1,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 4,
        });
    });

    it('returns zero counts when all report arrays are empty', () => {
        const todos: TodosDerivedValue = {
            reportsToSubmit: [],
            reportsToApprove: [],
            reportsToPay: [],
            reportsToExport: [],
            transactionsByReportID: {},
        };

        const result = todosReportCountsSelector(todos);

        expect(result).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: 0,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 0,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: 0,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 0,
        });
    });

    it('handles mixed empty and populated arrays', () => {
        const todos: TodosDerivedValue = {
            reportsToSubmit: [{reportID: '1'}, {reportID: '2'}] as TodosDerivedValue['reportsToSubmit'],
            reportsToApprove: [],
            reportsToPay: [],
            reportsToExport: [{reportID: '3'}] as TodosDerivedValue['reportsToExport'],
            transactionsByReportID: {},
        };

        const result = todosReportCountsSelector(todos);

        expect(result).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: 2,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 0,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: 0,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 1,
        });
    });

    it('handles large report counts correctly', () => {
        const todos: TodosDerivedValue = {
            reportsToSubmit: Array(100)
                .fill(null)
                .map((_, i) => ({reportID: `submit_${i}`})) as TodosDerivedValue['reportsToSubmit'],
            reportsToApprove: Array(50)
                .fill(null)
                .map((_, i) => ({reportID: `approve_${i}`})) as TodosDerivedValue['reportsToApprove'],
            reportsToPay: Array(25)
                .fill(null)
                .map((_, i) => ({reportID: `pay_${i}`})) as TodosDerivedValue['reportsToPay'],
            reportsToExport: Array(75)
                .fill(null)
                .map((_, i) => ({reportID: `export_${i}`})) as TodosDerivedValue['reportsToExport'],
            transactionsByReportID: {},
        };

        const result = todosReportCountsSelector(todos);

        expect(result).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: 100,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 50,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: 25,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 75,
        });
    });
});

describe('todosSingleReportIDsSelector', () => {
    it('returns EMPTY_TODOS_SINGLE_REPORT_IDS when todos is undefined', () => {
        const result = todosSingleReportIDsSelector(undefined);

        expect(result).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: undefined,
        });
    });

    it('returns EMPTY_TODOS_SINGLE_REPORT_IDS when all arrays are empty', () => {
        const todos: TodosDerivedValue = {
            reportsToSubmit: [],
            reportsToApprove: [],
            reportsToPay: [],
            reportsToExport: [],
            transactionsByReportID: {},
        };

        const result = todosSingleReportIDsSelector(todos);

        expect(result).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: undefined,
        });
    });

    it('returns report ID when exactly one report exists in each array', () => {
        const todos: TodosDerivedValue = {
            reportsToSubmit: [{reportID: '1'}] as TodosDerivedValue['reportsToSubmit'],
            reportsToApprove: [{reportID: '2'}] as TodosDerivedValue['reportsToApprove'],
            reportsToPay: [{reportID: '3'}] as TodosDerivedValue['reportsToPay'],
            reportsToExport: [{reportID: '4'}] as TodosDerivedValue['reportsToExport'],
            transactionsByReportID: {},
        };

        const result = todosSingleReportIDsSelector(todos);

        expect(result).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: '1',
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: '2',
            [CONST.SEARCH.SEARCH_KEYS.PAY]: '3',
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: '4',
        });
    });

    it('returns undefined for arrays with more than one report', () => {
        const todos: TodosDerivedValue = {
            reportsToSubmit: [{reportID: '1'}, {reportID: '2'}] as TodosDerivedValue['reportsToSubmit'],
            reportsToApprove: [{reportID: '3'}, {reportID: '4'}, {reportID: '5'}] as TodosDerivedValue['reportsToApprove'],
            reportsToPay: [{reportID: '6'}] as TodosDerivedValue['reportsToPay'],
            reportsToExport: [{reportID: '7'}, {reportID: '8'}] as TodosDerivedValue['reportsToExport'],
            transactionsByReportID: {},
        };

        const result = todosSingleReportIDsSelector(todos);

        expect(result).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: '6',
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: undefined,
        });
    });

    it('returns the same object reference when called twice with shallowly equal values (memoization)', () => {
        const todos: TodosDerivedValue = {
            reportsToSubmit: [{reportID: '10'}] as TodosDerivedValue['reportsToSubmit'],
            reportsToApprove: [] as unknown as TodosDerivedValue['reportsToApprove'],
            reportsToPay: [] as unknown as TodosDerivedValue['reportsToPay'],
            reportsToExport: [] as unknown as TodosDerivedValue['reportsToExport'],
            transactionsByReportID: {},
        };

        const first = todosSingleReportIDsSelector(todos);

        const todosClone: TodosDerivedValue = {
            reportsToSubmit: [{reportID: '10'}] as TodosDerivedValue['reportsToSubmit'],
            reportsToApprove: [] as unknown as TodosDerivedValue['reportsToApprove'],
            reportsToPay: [] as unknown as TodosDerivedValue['reportsToPay'],
            reportsToExport: [] as unknown as TodosDerivedValue['reportsToExport'],
            transactionsByReportID: {},
        };

        const second = todosSingleReportIDsSelector(todosClone);

        expect(second).toBe(first);
    });

    it('returns a new object reference when values change (memoization invalidation)', () => {
        const todos: TodosDerivedValue = {
            reportsToSubmit: [{reportID: '20'}] as TodosDerivedValue['reportsToSubmit'],
            reportsToApprove: [] as unknown as TodosDerivedValue['reportsToApprove'],
            reportsToPay: [] as unknown as TodosDerivedValue['reportsToPay'],
            reportsToExport: [] as unknown as TodosDerivedValue['reportsToExport'],
            transactionsByReportID: {},
        };

        const first = todosSingleReportIDsSelector(todos);

        const todosChanged: TodosDerivedValue = {
            reportsToSubmit: [{reportID: '21'}] as TodosDerivedValue['reportsToSubmit'],
            reportsToApprove: [] as unknown as TodosDerivedValue['reportsToApprove'],
            reportsToPay: [] as unknown as TodosDerivedValue['reportsToPay'],
            reportsToExport: [] as unknown as TodosDerivedValue['reportsToExport'],
            transactionsByReportID: {},
        };

        const second = todosSingleReportIDsSelector(todosChanged);

        expect(second).not.toBe(first);
        expect(second[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe('21');
    });
});

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
