import {parse} from '@libs/SearchParser';
import CONST from '@src/CONST';

describe('SearchParser', () => {
    it('should default to expense type when no defaultType is provided', () => {
        const result = parse('test query');
        expect(result.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
    });

    it('should use provided defaultType', () => {
        const result = parse('test query', CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);
        expect(result.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);
    });

    it('should override defaultType when type is explicitly specified in query', () => {
        const result = parse('type:expense test query', CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);
        expect(result.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
    });

    it('should handle empty query', () => {
        const result = parse('', CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);
        expect(result.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);
    });
});