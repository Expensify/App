// cspell:ignore Dienstag Freitag März
import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import {de} from 'date-fns/locale/de';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('DateUtils.getFormattedReservationRangeDate', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 5, 1));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('keeps the English reservation dates unchanged', () => {
        // Given a stay this year and a stay in a past year, with no locale, which falls back to en-US
        // When their date ranges are formatted
        // Then English keeps the `EEEE, MMM d` shape, adding the year only outside the current year
        expect(DateUtils.getFormattedReservationRangeDate(translateLocal, undefined, new Date(2026, 2, 17), new Date(2026, 2, 17))).toBe('Tuesday, Mar 17');
        expect(DateUtils.getFormattedReservationRangeDate(translateLocal, undefined, new Date(2023, 2, 17), new Date(2023, 2, 17))).toBe('Friday, Mar 17, 2023');
    });

    it('orders each reservation date the way the language does', () => {
        // Given a stay this year and a stay in a past year
        // When their date ranges are formatted in German
        // Then the day comes before the month. The hand-written pattern kept the US order and showed the month first.
        expect(DateUtils.getFormattedReservationRangeDate(translateLocal, de, new Date(2026, 2, 17), new Date(2026, 2, 17))).toBe('Dienstag, 17. März');
        expect(DateUtils.getFormattedReservationRangeDate(translateLocal, de, new Date(2023, 2, 17), new Date(2023, 2, 17))).toBe('Freitag, 17. März 2023');
    });
});
