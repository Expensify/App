// These literal labels deliberately cover locale grammar rather than translating English date patterns.
// cspell:ignore janvier janv jueves enero jeudi Januar Donnerstag Freitag Πέμπτη Ιανουαρίου gennaio giovedì januari donderdag czwartek stycznia sty janeiro quinta feira yearless
import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import {toZonedTime} from 'date-fns-tz';
import {de} from 'date-fns/locale/de';
import {el} from 'date-fns/locale/el';
import {enUS} from 'date-fns/locale/en-US';
import {es} from 'date-fns/locale/es';
import {fr} from 'date-fns/locale/fr';
import {it as itLocale} from 'date-fns/locale/it';
import {ja} from 'date-fns/locale/ja';
import {nl} from 'date-fns/locale/nl';
import {pl} from 'date-fns/locale/pl';
import {ptBR} from 'date-fns/locale/pt-BR';
import {zhCN} from 'date-fns/locale/zh-CN';

describe('Display date contracts', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-11-03T20:00:00Z'));
    });

    afterEach(() => jest.useRealTimers());

    it.each([
        [enUS, 'January 22, 2026', 'Jan 22', 'Jan 22, 2025', 'Thursday, January 22', 'January 22nd, 2026'],
        [es, '22 de enero de 2026', '22 ene', '22 ene 2025', 'jueves, 22 de enero', '22 de enero de 2026'],
        [fr, '22 janvier 2026', '22 janv.', '22 janv. 2025', 'jeudi 22 janvier', '22 janvier 2026'],
        [de, '22. Januar 2026', '22. Jan.', '22. Jan. 2025', 'Donnerstag, 22. Januar', '22. Januar 2026'],
        [el, '22 Ιανουαρίου 2026', '22 Ιαν', '22 Ιαν 2025', 'Πέμπτη 22 Ιανουαρίου', '22 Ιανουαρίου 2026'],
        [itLocale, '22 gennaio 2026', '22 gen', '22 gen 2025', 'giovedì 22 gennaio', '22 gennaio 2026'],
        [ja, '2026年1月22日', '1月22日', '2025/01/22', '1月22日木曜日', '2026年1月22日'],
        [nl, '22 januari 2026', '22 jan', '22 jan. 2025', 'donderdag 22 januari', '22 januari 2026'],
        [pl, '22 stycznia 2026', '22 sty', '22 sty 2025', 'czwartek, 22 stycznia', '22 stycznia 2026'],
        [ptBR, '22 de janeiro de 2026', '22 de jan.', '22 jan 2025', 'quinta-feira, 22 de janeiro', '22 de janeiro de 2026'],
        [zhCN, '2026年1月22日', '1月22日', '2025-01-22', '1月22日星期四', '2026年1月22日'],
    ] as const)('formats each display shape for $code', (locale, longDate, monthDay, previousYear, yearlessWeekday, ordinalDate) => {
        // Given the same stored expense dates and calendar day in each shipped locale
        const calendarDate = new Date(2026, 0, 22);

        // When the explicit-locale display helpers render full, yearless, and ordinal forms
        const labels = {
            longDate: DateUtils.formatUTCDateForDisplay('2026-01-22', locale),
            monthDay: DateUtils.formatMonthDayWithUTCTimeZone('2026-01-22', locale),
            currentYear: DateUtils.formatUTCDateWithOptionalYear('2026-01-22', locale),
            previousYear: DateUtils.formatUTCDateWithOptionalYear('2025-01-22', locale),
            yearlessWeekday: DateUtils.formatToLongDateWithWeekdayWithoutYear(calendarDate, locale),
            ordinalDate: DateUtils.formatViolationSnapshotStartedAtDate('2026-01-22', 'America/Los_Angeles', locale),
        };

        // Then grammar and year inclusion match literal, independently checked expectations
        expect(labels).toEqual({longDate, monthDay, currentYear: monthDay, previousYear, yearlessWeekday, ordinalDate});
    });

    it.each(['', 'not-a-date'])('returns empty display labels for invalid input %s', (input) => {
        // Given a missing or invalid stored date
        // When display adapters receive it
        const labels = [DateUtils.formatUTCDateForDisplay(input, de), DateUtils.formatUTCDateWithOptionalYear(input, de), DateUtils.formatMonthDayWithUTCTimeZone(input, de)];

        // Then they retain empty-label fallbacks rather than throwing from Intl
        expect(labels).toEqual(['', '', '']);
    });

    it('defaults display helpers to US English without adding ordinals', () => {
        // Given no loaded date-fns locale at a display boundary
        // When a calendar date is rendered
        const label = DateUtils.formatDisplayDate(new Date(2026, 0, 22), undefined);

        // Then the fallback is explicitly US English and remains non-ordinal
        expect(label).toBe('January 22, 2026');
    });

    it('does not shift an already-adjusted wall-clock date twice', () => {
        // Given a UTC instant whose calendar date is still December 31 in Los Angeles
        const date = toZonedTime(new Date('2027-01-01T01:00:00Z'), 'America/Los_Angeles');
        const now = toZonedTime(new Date('2027-01-01T03:00:00Z'), 'America/Los_Angeles');

        // When those adjusted calendar fields are formatted without another timezone conversion
        const label = DateUtils.formatDateWithOptionalYear(date, de, now);

        // Then the visible date stays in the viewer's current year
        expect(label).toBe('31. Dez.');
    });

    it('keeps UTC calendar dates on January 1 independently of the device timezone', () => {
        // Given a stored January 1 expense and a UTC now in the same year
        jest.setSystemTime(new Date('2026-01-01T01:00:00Z'));

        // When the UTC display adapter decides whether the label needs a year
        const label = DateUtils.formatUTCDateWithOptionalYear('2026-01-01', de);

        // Then the first day is not mistaken for December 31 of the previous year
        expect(label).toBe('1. Jan.');
    });

    it('preserves leap-day calendar values', () => {
        // Given a valid leap day in a calendar-only expense field
        // When it is formatted in a year-first language
        const label = DateUtils.formatUTCDateForDisplay('2024-02-29', ja);

        // Then no timezone conversion or missing-year reconstruction changes its day
        expect(label).toBe('2024年2月29日');
    });

    it('formats a scheduled-call instant once in its selected timezone', () => {
        // Given an instant that is still December 31 UTC but already January 1 in Tokyo
        const instant = '2026-12-31T23:00:00Z';

        // When a scheduled-call heading renders in Tokyo for a German-speaking viewer
        const label = DateUtils.formatDisplayDateInTimeZone(instant, 'Asia/Tokyo', de);

        // Then the weekday and full date use the selected timezone and German grammar together
        expect(label).toBe('Freitag, 1. Januar 2027');
    });

    it('preserves the comma-separated per-diem date range used in stored merchant text', () => {
        // Given the explicit locale and dates passed to the per-diem merchant generator
        const start = new Date(2026, 0, 22);
        const end = new Date(2026, 0, 23);

        // When its existing date-range formatter produces the persisted merchant's date portion
        const range = DateUtils.getFormattedDateRangeForPerDiem(start, end, de);

        // Then its punctuation contract stays compatible with existing receipts rather than becoming a localized display label
        expect(range).toBe('Jan. 22, 2026 - Jan. 23, 2026');
    });

    it('leaves machine date formats fixed', () => {
        // Given formats used for backend payloads and lookup keys
        // When the display-format migration is applied
        // Then their syntax remains independent of the user's language
        expect([
            CONST.DATE.FNS_FORMAT_STRING,
            CONST.DATE.FNS_DATE_TIME_FORMAT_STRING,
            CONST.DATE.FNS_TIMEZONE_FORMAT_STRING,
            CONST.DATE.FNS_DB_FORMAT_STRING,
            CONST.DATE.YEAR_MONTH_FORMAT,
        ]).toEqual(['yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', "yyyy-MM-dd'T'HH:mm:ssXXX", 'yyyy-MM-dd HH:mm:ss.SSS', 'yyyyMM']);
    });
});
