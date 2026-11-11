import polyfillDateTimeFormatRange from '@libs/IntlPolyfill/polyfillDateTimeFormatRange';

import CONST from '@src/CONST';
import {shouldPolyfillDateTimeFormatRange} from '@src/languages/shouldPolyfill';

import {DateTimeFormat as FormatjsDateTimeFormat} from '@formatjs/intl-datetimeformat';

// cspell:ignore Juni juin
const NATIVE_FORMAT_RANGE = Object.getOwnPropertyDescriptor(Intl.DateTimeFormat.prototype, 'formatRange');

const JUNE_20 = new Date(Date.UTC(2026, 5, 20));
const JUNE_27 = new Date(Date.UTC(2026, 5, 27));
const MONTH_DAY_IN_UTC: Intl.DateTimeFormatOptions = {month: 'short', day: 'numeric', timeZone: 'UTC'};

/** Removes Node's `formatRange`, which Hermes on iOS lacks, and installs the polyfill in its place. */
function installPolyfillWithoutNativeFormatRange() {
    Reflect.deleteProperty(Intl.DateTimeFormat.prototype, 'formatRange');
    polyfillDateTimeFormatRange();
}

describe('polyfillDateTimeFormatRange', () => {
    afterEach(() => {
        // Each case starts from Node's own `formatRange` and without the polyfill's `__addLocaleData` forwarder
        if (NATIVE_FORMAT_RANGE) {
            Object.defineProperty(Intl.DateTimeFormat.prototype, 'formatRange', NATIVE_FORMAT_RANGE);
        }
        Reflect.deleteProperty(Intl.DateTimeFormat, '__addLocaleData');
    });

    it('leaves the engine formatRange in place when it exists', () => {
        // Given an engine that already has `formatRange`, as every browser and Node do
        // When the polyfill runs
        polyfillDateTimeFormatRange();

        // Then the engine's own method is kept and no formatjs locale data is ever requested
        expect(Object.getOwnPropertyDescriptor(Intl.DateTimeFormat.prototype, 'formatRange')).toEqual(NATIVE_FORMAT_RANGE);
        expect(shouldPolyfillDateTimeFormatRange(CONST.LOCALES.DE)).toBe(false);
    });

    it('collapses a range the way formatRange does once the language data has loaded', async () => {
        // Given an engine without `formatRange`, with the English and German data that IntlStore loads for those languages
        installPolyfillWithoutNativeFormatRange();
        await import('@formatjs/intl-datetimeformat/locale-data/en');
        await import('@formatjs/intl-datetimeformat/locale-data/de');

        // When a range within one month is formatted
        // Then the shared month and year are written once, as the engine's own `formatRange` does on web, with thin spaces
        // around the dash in English
        expect(new Intl.DateTimeFormat('en-US', MONTH_DAY_IN_UTC).formatRange(JUNE_20, JUNE_27)).toBe('Jun 20 – 27');
        expect(new Intl.DateTimeFormat('de', {...MONTH_DAY_IN_UTC, year: 'numeric'}).formatRange(JUNE_20, JUNE_27)).toBe('20.–27. Juni 2026');
    });

    it('keeps the month in a Chinese range with a year', async () => {
        // Given the formatjs version the polyfill is built on, with the Chinese data registered through the polyfill
        installPolyfillWithoutNativeFormatRange();
        await import('@formatjs/intl-datetimeformat/locale-data/zh');

        // When a Chinese range with a year is formatted
        const range = new FormatjsDateTimeFormat('zh-CN', {...MONTH_DAY_IN_UTC, year: 'numeric'}).formatRange(JUNE_20, JUNE_27);

        // Then the month is kept. formatjs 8 drops it here and shows 2026年620日 – 27日, which is why 6.12.6 is pinned.
        // The engine is skipped because Node formats this Chinese date numerically, unlike Hermes.
        expect(range).toBe('2026年6月20日至27日');
    });

    it('joins the two dates until the language data loads, then collapses the range', async () => {
        // Given an engine without `formatRange` and a language whose data IntlStore has not loaded yet
        installPolyfillWithoutNativeFormatRange();
        const formatter = new Intl.DateTimeFormat('fr', MONTH_DAY_IN_UTC);
        expect(shouldPolyfillDateTimeFormatRange(CONST.LOCALES.FR)).toBe(true);

        // When a range is formatted before the data loads
        // Then the two dates come from the engine in French, rather than from formatjs falling back to English
        expect(formatter.formatRange(JUNE_20, JUNE_27)).toBe('20 juin – 27 juin');

        // When the data loads and the same formatter formats the range again
        await import('@formatjs/intl-datetimeformat/locale-data/fr');

        // Then the range is collapsed and IntlStore no longer needs to load the data
        expect(formatter.formatRange(JUNE_20, JUNE_27)).toBe('20–27 juin');
        expect(shouldPolyfillDateTimeFormatRange(CONST.LOCALES.FR)).toBe(false);
    });

    it('joins the two dates in a time zone other than UTC', async () => {
        // Given an engine without `formatRange`, with English data loaded but no time zone data
        installPolyfillWithoutNativeFormatRange();
        await import('@formatjs/intl-datetimeformat/locale-data/en');

        // When a range starting at midnight UTC is formatted in Los Angeles, where it is still the previous day
        const formatter = new Intl.DateTimeFormat('en-US', {...MONTH_DAY_IN_UTC, timeZone: 'America/Los_Angeles'});

        // Then the engine's own dates are shown on the right days. formatjs reads a zone it has no data for as UTC and
        // would show June 20 to 27.
        expect(formatter.formatRange(JUNE_20, JUNE_27)).toBe('Jun 19 – Jun 26');
    });
});
