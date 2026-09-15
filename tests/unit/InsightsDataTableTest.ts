import {formatPercentOfTotal} from '@components/Search/InsightsDataTable';

import CONST from '@src/CONST';

describe('formatPercentOfTotal', () => {
    it('keeps one decimal place when the share has one', () => {
        expect(formatPercentOfTotal(40.14, 10000, CONST.LOCALES.EN)).toBe('40.1%');
        expect(formatPercentOfTotal(3.5, 10000, CONST.LOCALES.EN)).toBe('3.5%');
    });

    it('drops the decimal when the share is round, so it does not read as false precision', () => {
        expect(formatPercentOfTotal(30, 10000, CONST.LOCALES.EN)).toBe('30%');
        expect(formatPercentOfTotal(100, 10000, CONST.LOCALES.EN)).toBe('100%');
    });

    it('reports a share too small to round as "less than", not as zero', () => {
        expect(formatPercentOfTotal(0.03, 10000, CONST.LOCALES.EN)).toBe('<0.1%');
    });

    it('reports a group the search rounded down to zero as "less than", since it still spent something', () => {
        expect(formatPercentOfTotal(0, 47392, CONST.LOCALES.EN)).toBe('<0.1%');
    });

    it('shows a group that spent nothing as a genuine zero', () => {
        expect(formatPercentOfTotal(0, 0, CONST.LOCALES.EN)).toBe('0%');
    });

    it('carries the float precision the search reports without reading as false precision', () => {
        expect(formatPercentOfTotal(98.77999877929688, 5970688778, CONST.LOCALES.EN)).toBe('98.8%');
        expect(formatPercentOfTotal(0.6299999952316284, 38285552, CONST.LOCALES.EN)).toBe('0.6%');
    });

    it('uses the locale decimal separator rather than a hand-built string', () => {
        expect(formatPercentOfTotal(40.14, 10000, CONST.LOCALES.PL)).toBe('40,1%');
    });
});
