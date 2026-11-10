import formatExpenseCount from '@components/Charts/utils/formatExpenseCount';

import {format} from '@libs/NumberFormatUtils';

import CONST from '@src/CONST';
import en from '@src/languages/en';
import IntlStore from '@src/languages/IntlStore';

import {translateLocal} from '../../../utils/TestHelper';

const numberFormat = (value: number, options?: Intl.NumberFormatOptions) => format(CONST.LOCALES.EN, value, options);

describe('formatExpenseCount', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
    });

    it('groups the digits of a large count', () => {
        // Given a chart bucket holding more expenses than fit in a group of three digits
        // When the count is named
        const label = formatExpenseCount(1234, translateLocal, numberFormat);

        // Then the number is grouped the way the locale groups numbers, rather than printed as raw digits
        expect(label).toBe('1,234 expenses');
    });

    it('rounds a fractional count rather than writing out the division', () => {
        // Given an average count, which falls between whole expenses
        // When the count is named
        const label = formatExpenseCount(12.3456, translateLocal, numberFormat);

        // Then it keeps two decimals, enough to tell neighboring averages apart without spelling out the division
        expect(label).toBe('12.35 expenses');
    });

    it('names an empty bucket as zero', () => {
        // Given a period with no counterpart in the compared period, which the chart plots as 0
        // When the count is named
        const label = formatExpenseCount(0, translateLocal, numberFormat);

        // Then it reports zero rather than borrowing the singular
        expect(label).toBe('0 expenses');
    });

    it('carries the formatted number into the singular form', () => {
        // Given a count whose plural category is `one` in French and Brazilian Portuguese, though not in English
        const {one} = en.iou.expenseCount({count: 0, formattedCount: '0'});

        // When the singular form renders
        const label = typeof one === 'function' ? one(0) : one;

        // Then it prints the count it was given, so the locales generated from this entry don't hard-code a 1 for values that aren't 1
        expect(label).toBe('0 expense');
    });
});
