// cspell:ignore Juni
import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import {de} from 'date-fns/locale/de';
import {es} from 'date-fns/locale/es';
import {ja} from 'date-fns/locale/ja';

// Midday UTC, so the displayed day is the same in every timezone the test can run in.
const DATETIME = '2026-06-20 12:00:00';

describe('DateUtils abbreviated date with a year', () => {
    it('keeps the English abbreviated date unchanged', () => {
        // Given a date and no locale, which falls back to en-US
        // When it is formatted with the abbreviated date constant
        // Then English keeps the `MMM d, yyyy` shape it had before the constant became a localized token
        expect(DateUtils.formatWithUTCTimeZone(DATETIME, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, undefined)).toBe('Jun 20, 2026');
    });

    it('orders the date the way each language does', () => {
        // Given languages that do not write a short date in the US order
        // When the same date is formatted in each
        // Then the day comes first in German and Spanish and Japanese uses its numeric year-first form. The
        // hand-written pattern kept the US order for every language, which produced forms like `Juni 20, 2026`.
        expect(DateUtils.formatWithUTCTimeZone(DATETIME, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, de)).toBe('20. Juni 2026');
        expect(DateUtils.formatWithUTCTimeZone(DATETIME, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, es)).toBe('20 jun 2026');
        expect(DateUtils.formatWithUTCTimeZone(DATETIME, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, ja)).toBe('2026/06/20');
    });
});
