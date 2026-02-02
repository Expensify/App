import todosReportCountsSelector from '@selectors/Todos';
import CONST from '@src/CONST';
import type {TodosDerivedValue} from '@src/types/onyx';

describe('todosReportCountsSelector', () => {
    it('returns empty counts when todos is undefined', () => {
        const result = todosReportCountsSelector(undefined);

        expect(result).toEqual(CONST.EMPTY_TODOS_REPORT_COUNTS);
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
