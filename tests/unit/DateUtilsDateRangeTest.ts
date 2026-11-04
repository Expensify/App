// cspell:ignore März
import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import {de} from 'date-fns/locale/de';
import {es} from 'date-fns/locale/es';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// `Intl` puts thin spaces around the en dash in an English range.
const THIN_SPACE = '\u2009';

describe('DateUtils.getFormattedDateRange', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    it('shows a single day as an abbreviated month and day', () => {
        // Given a trip that starts and ends on the same day
        // When its date range is formatted
        // Then only that day is shown, in English and in the German day-first order
        expect(DateUtils.getFormattedDateRange(translateLocal, undefined, new Date(2026, 2, 17), new Date(2026, 2, 17))).toBe('Mar 17');
        expect(DateUtils.getFormattedDateRange(translateLocal, de, new Date(2026, 2, 17), new Date(2026, 2, 17))).toBe('17. März');
    });

    it('joins a same-month range the way each language does', () => {
        // Given a trip within one month
        // When its date range is formatted
        // Then the language's own range form is used. A hand-written `MMM d-d` gave `März 17-20` in German, which
        // is not how German writes a range.
        const start = new Date(2026, 2, 17);
        const end = new Date(2026, 2, 20);
        expect(DateUtils.getFormattedDateRange(translateLocal, undefined, start, end)).toBe(`Mar 17${THIN_SPACE}–${THIN_SPACE}20`);
        expect(DateUtils.getFormattedDateRange(translateLocal, de, start, end)).toBe('17.–20. März');
        expect(DateUtils.getFormattedDateRange(translateLocal, es, start, end)).toBe('17–20 mar');
    });

    it('still joins a same-month range on an engine without formatRange', () => {
        // Given an engine that does not implement `Intl.DateTimeFormat.prototype.formatRange`, as can happen on Hermes
        const formatRangeDescriptor = Object.getOwnPropertyDescriptor(Intl.DateTimeFormat.prototype, 'formatRange');
        // @ts-expect-error -- removed on purpose to reproduce an engine that leaves the method out
        delete Intl.DateTimeFormat.prototype.formatRange;

        try {
            // When a same-month range is formatted
            const result = DateUtils.getFormattedDateRange(translateLocal, undefined, new Date(2026, 2, 17), new Date(2026, 2, 20));

            // Then both dates are still shown, joined with a dash, instead of the preview throwing
            expect(result).toBe('Mar 17 – Mar 20');
        } finally {
            if (formatRangeDescriptor) {
                Object.defineProperty(Intl.DateTimeFormat.prototype, 'formatRange', formatRangeDescriptor);
            }
        }
    });

    it('joins dates in different months with the translated connector', () => {
        // Given a trip that spans two months in the same year
        // When its date range is formatted
        // Then both dates are shown without a year and joined with the translated "to"
        expect(DateUtils.getFormattedDateRange(translateLocal, undefined, new Date(2026, 1, 28), new Date(2026, 2, 1))).toBe('Feb 28 to Mar 1');
    });

    it('adds the year when the range crosses into another year', () => {
        // Given a trip that spans New Year
        // When its date range is formatted
        // Then both dates carry their year so the range is not ambiguous
        expect(DateUtils.getFormattedDateRange(translateLocal, undefined, new Date(2023, 11, 28), new Date(2024, 0, 5))).toBe('Dec 28, 2023 to Jan 5, 2024');
    });
});
