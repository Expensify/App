import CONST from '@src/CONST';

describe('search date range constants', () => {
    it('defines all new range-related constants', () => {
        const reportFieldPrefixes = CONST.SEARCH.REPORT_FIELD as Record<string, string>;

        expect(CONST.POPOVER_DATE_RANGE_WIDTH).toBe(672);
        expect(CONST.SEARCH.SYNTAX_OPERATORS.RANGE).toBe('range');
        expect(reportFieldPrefixes.RANGE_PREFIX).toBe('reportFieldRange-');
        expect(CONST.SEARCH.DATE_MODIFIERS.RANGE).toBe('Range');
    });

    it('keeps custom date modifier list unchanged', () => {
        expect(CONST.SEARCH.CUSTOM_DATE_MODIFIERS).toEqual([CONST.SEARCH.DATE_MODIFIERS.ON, CONST.SEARCH.DATE_MODIFIERS.BEFORE, CONST.SEARCH.DATE_MODIFIERS.AFTER]);
        expect(CONST.SEARCH.CUSTOM_DATE_MODIFIERS).not.toContain(CONST.SEARCH.DATE_MODIFIERS.RANGE);
    });
});
