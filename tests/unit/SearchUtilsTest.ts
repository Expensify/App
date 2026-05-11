import {buildSearchQuery, getDefaultSearchTypeForPage} from '@libs/SearchUtils';
import CONST from '@src/CONST';

describe('SearchUtils', () => {
    describe('getDefaultSearchTypeForPage', () => {
        it('should return expense-report for Reports page', () => {
            const result = getDefaultSearchTypeForPage(CONST.SCREENS.REPORTS);
            expect(result).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);
        });

        it('should return expense for Search page', () => {
            const result = getDefaultSearchTypeForPage(CONST.SCREENS.SEARCH);
            expect(result).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
        });

        it('should return expense for Expenses page', () => {
            const result = getDefaultSearchTypeForPage(CONST.SCREENS.EXPENSES);
            expect(result).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
        });

        it('should return undefined for unknown page', () => {
            const result = getDefaultSearchTypeForPage('UnknownPage');
            expect(result).toBeUndefined();
        });

        it('should return undefined when no page is provided', () => {
            const result = getDefaultSearchTypeForPage();
            expect(result).toBeUndefined();
        });
    });

    describe('buildSearchQuery', () => {
        it('should use page context to determine default type', () => {
            const result = buildSearchQuery('test', CONST.SCREENS.REPORTS);
            expect(result.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);
        });

        it('should fallback to expense when no page is provided', () => {
            const result = buildSearchQuery('test');
            expect(result.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
        });

        it('should respect explicit type in query over page context', () => {
            const result = buildSearchQuery('type:expense test', CONST.SCREENS.REPORTS);
            expect(result.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
        });
    });
});