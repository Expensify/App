import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import {timezoneBackwardToNewMap, timezoneNewToBackwardMap} from '@src/TIMEZONES';
import type Locale from '@src/types/onyx/Locale';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';

import type {Day as WeekDay} from 'date-fns';
import type {ValueOf} from 'type-fest';

import {
    addDays,
    addHours,
    addMilliseconds,
    addMinutes,
    differenceInDays,
    eachDayOfInterval,
    endOfDay,
    endOfMonth,
    endOfWeek,
    format,
    getDate,
    getDay,
    intervalToDuration,
    isAfter,
    isBefore,
    isSameDay,
    isSameMonth,
    isSameSecond,
    isSameYear,
    isThisYear,
    isValid,
    parse,
    set,
    startOfDay,
    startOfWeek,
    subDays,
    subMilliseconds,
    subMinutes,
} from 'date-fns';
import {formatInTimeZone, fromZonedTime, toDate, toZonedTime, format as tzFormat} from 'date-fns-tz';
import {enUS} from 'date-fns/locale/en-US';
import {Str} from 'expensify-common';
import throttle from 'lodash/throttle';

import {setCurrentDate} from './actions/CurrentDate';
import {
    INTL_FORMAT_CACHE_MAX_SIZE,
    clearIntlFormatterCaches,
    intlDateTimeFormatCache,
    refreshIntlFormatterCaches,
    registerDerivedIntlCache,
    relativeTimeFormatCache,
} from './IntlFormatterCaches';
import {translate as translateLocalize} from './Localize';
import Log from './Log';
import memoize from './memoize';

type CustomStatusTypes = ValueOf<typeof CONST.CUSTOM_STATUS_TYPES>;

type MachineDateFormat =
    | typeof CONST.DATE.FNS_FORMAT_STRING
    | typeof CONST.DATE.FNS_DB_FORMAT_STRING
    | typeof CONST.DATE.FNS_DATE_TIME_FORMAT_STRING
    | typeof CONST.DATE.FNS_TIMEZONE_FORMAT_STRING;

const TIMEZONE_UPDATE_THROTTLE_MINUTES = 5;

type IntlFormatKey = keyof typeof CONST.DATE.INTL_FORMATS;

function isKnownTimezone(tz: string): tz is SelectedTimezone {
    return tz in timezoneNewToBackwardMap;
}

/** A Wednesday in UTC, used where only the locale's own conventions matter and the instant must not vary by run. */
const LOCALE_PROBE_DATE = new Date(Date.UTC(2023, 0, 4));

const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const satisfies readonly WeekDay[];
function isWeekDay(value: number): value is WeekDay {
    return (WEEK_DAYS as readonly number[]).includes(value);
}

/** Hand-rolled rather than `memoize`: this runs per rendered cell, and that cache scans its entries linearly. */
function cacheIntlDateTimeFormat(cacheKey: string, formatter: Intl.DateTimeFormat | null): void {
    if (intlDateTimeFormatCache.size >= INTL_FORMAT_CACHE_MAX_SIZE) {
        const oldestKey = intlDateTimeFormatCache.keys().next().value;
        if (oldestKey !== undefined) {
            intlDateTimeFormatCache.delete(oldestKey);
        }
    }
    intlDateTimeFormatCache.set(cacheKey, formatter);
}

function getIntlDateTimeFormat(locale: Locale, formatKey: IntlFormatKey, timeZone?: string): Intl.DateTimeFormat | null {
    const cacheKey = `${locale}|${formatKey}|${timeZone ?? ''}`;
    if (intlDateTimeFormatCache.has(cacheKey)) {
        const cached = intlDateTimeFormatCache.get(cacheKey) ?? null;
        intlDateTimeFormatCache.delete(cacheKey);
        intlDateTimeFormatCache.set(cacheKey, cached);
        return cached;
    }
    const preset = CONST.DATE.INTL_FORMATS[formatKey];
    const backwardTimeZone = timeZone && isKnownTimezone(timeZone) ? timezoneNewToBackwardMap[timeZone] : undefined;
    // Dropping the timezone is never a candidate: it would render another zone's wall clock.
    const timeZoneCandidates = backwardTimeZone && backwardTimeZone !== timeZone ? [timeZone, backwardTimeZone] : [timeZone];
    const localeCandidates: Locale[] = locale === CONST.LOCALES.DEFAULT ? [locale] : [locale, CONST.LOCALES.DEFAULT];
    for (const candidateLocale of localeCandidates) {
        for (const candidateTimeZone of timeZoneCandidates) {
            try {
                const formatter = new Intl.DateTimeFormat(candidateLocale, candidateTimeZone ? {...preset, timeZone: candidateTimeZone} : preset);
                if (candidateLocale !== locale || candidateTimeZone !== timeZone) {
                    Log.warn('[DateUtils] Intl.DateTimeFormat constructed on a fallback candidate', {locale, formatKey, timeZone, candidateLocale, candidateTimeZone});
                }
                cacheIntlDateTimeFormat(cacheKey, formatter);
                return formatter;
            } catch {
                continue;
            }
        }
    }
    Log.warn('[DateUtils] Intl.DateTimeFormat construction failed for every candidate', {locale, formatKey, timeZone, backwardTimeZone});
    cacheIntlDateTimeFormat(cacheKey, null);
    return null;
}

/**
 * Cached Intl formatter with the ICU 72+ narrow no-break space stripped before AM/PM.
 *
 * Returns `''` on Invalid Date or when the formatter cannot be constructed. Concatenating callers can short-circuit
 * on the empty string instead of rendering the wrong wall-clock time from a silent UTC fallback.
 */
function formatIntl(locale: Locale, formatKey: IntlFormatKey, date: Date, timeZone?: string): string {
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const formatter = getIntlDateTimeFormat(locale, formatKey, timeZone);
    if (!formatter) {
        return '';
    }
    return formatter.format(date).replaceAll(CONST.DATE.INTL_NBSP_PATTERN, ' ');
}

/** `en` resolves to en-US and therefore Sunday, which would move the calendar for every existing English user. */
const WEEK_STARTS_ON_OVERRIDES: Partial<Record<Locale, WeekDay>> = {
    [CONST.LOCALES.EN]: 1,
};

/** CLDR week starts, for engines without `Intl.Locale.getWeekInfo`. */
const WEEK_STARTS_ON_BY_LOCALE: Readonly<Record<Locale, WeekDay>> = {
    [CONST.LOCALES.EN]: 0,
    [CONST.LOCALES.FR]: 1,
    [CONST.LOCALES.DE]: 1,
    [CONST.LOCALES.IT]: 1,
    [CONST.LOCALES.ES]: 1,
    [CONST.LOCALES.NL]: 1,
    [CONST.LOCALES.PL]: 1,
    [CONST.LOCALES.EL]: 1,
    [CONST.LOCALES.ZH_HANS]: 1,
    [CONST.LOCALES.JA]: 0,
    [CONST.LOCALES.PT_BR]: 0,
};

/** Memoized for the callers React Compiler does not cover, where each miss constructs an `Intl.Locale`. */
const getWeekStartsOn = memoize(
    (locale: Locale): WeekDay => {
        const override = WEEK_STARTS_ON_OVERRIDES[locale];
        if (override !== undefined) {
            return override;
        }
        try {
            const intlLocale = new Intl.Locale(locale);
            const weekInfo = typeof intlLocale.getWeekInfo === 'function' ? intlLocale.getWeekInfo() : intlLocale.weekInfo;
            if (weekInfo) {
                // Intl counts Mon=1 to Sun=7, date-fns counts Sun=0 to Sat=6.
                const dateFnsDay = weekInfo.firstDay === 7 ? 0 : weekInfo.firstDay;
                if (isWeekDay(dateFnsDay)) {
                    return dateFnsDay;
                }
            }
        } catch {}
        // The tag reaches here from an Onyx NVP, so a malformed persisted value would index the map to undefined.
        return WEEK_STARTS_ON_BY_LOCALE[locale] ?? CONST.WEEK_STARTS_ON;
    },
    {maxSize: 16, equality: 'shallow'},
);

function getWeekEndsOn(locale: Locale): WeekDay {
    return WEEK_DAYS[(getWeekStartsOn(locale) + 6) % 7];
}

/**
 * Returns a zoned Date for the given datetime. Unzoned `string` values are the DB wire format and read as UTC;
 * `Date`/`number` passes through; `undefined` reads `Date.now()` — only safe outside render.
 * `locale` is unused; kept on the signature for compat with LocaleContextProvider's wrapper.
 */
function getLocalDateFromDatetime(locale: Locale, currentSelectedTimezone: string, datetime?: string | Date | number): Date {
    // `''` counts as absent, as it did before the signature widened: callers pass `?? ''` for a missing field. A `0`
    // timestamp is a real instant, which is why this is not a plain falsy check.
    if (datetime === undefined || datetime === '') {
        return toZonedSafe(new Date(), currentSelectedTimezone);
    }
    if (datetime instanceof Date || typeof datetime === 'number') {
        return toZonedSafe(datetime, currentSelectedTimezone);
    }
    // `toDate` reads an unzoned value as UTC, honours an embedded offset when there is one, and parses the space-separated
    // wire shape on every engine. Appending `Z` to that shape instead relied on a V8 leniency Hermes lacks, which left
    // every chat timestamp showing the current time. It only understands ISO-like input, so non-ISO strings (a
    // `Date.prototype.toString()` value, which an engine is required to parse back) still need the engine's own parser.
    const isoParsed = toDate(datetime, {timeZone: 'UTC'});
    return toZonedSafe(Number.isNaN(isoParsed.getTime()) ? new Date(datetime) : isoParsed, currentSelectedTimezone);
}

/** Recovers from a rejected timezone, never from an invalid input: that one stays invalid so `formatIntl` yields ''. */
function toZonedSafe(date: Date | number, timeZone: string): Date {
    const zoned = toZonedTime(date, timeZone);
    if (!Number.isNaN(zoned.getTime()) || Number.isNaN(new Date(date).getTime())) {
        return zoned;
    }
    Log.warn('DateUtils.toZonedSafe: the platform rejected this timezone; rendering the unzoned instant.', {date, timeZone});
    return new Date(date);
}

/**
 * Checks if a given date is today in the specified time zone.
 *
 * @param date - The date to compare.
 * @param timeZone - The time zone to consider.
 * @returns True if the date is today; otherwise, false.
 */
function isToday(date: Date, timeZone: SelectedTimezone): boolean {
    const currentDate = new Date();
    const currentDateInTimeZone = toZonedTime(currentDate, timeZone);
    return isSameDay(date, currentDateInTimeZone);
}

/**
 * Checks if a given date is tomorrow in the specified time zone.
 *
 * @param date - The date to compare.
 * @param timeZone - The time zone to consider.
 * @returns True if the date is tomorrow; otherwise, false.
 */
function isTomorrow(date: Date, timeZone: SelectedTimezone): boolean {
    const currentDate = new Date();
    const tomorrow = addDays(currentDate, 1); // Get the date for tomorrow in the current time zone
    const tomorrowInTimeZone = toZonedTime(tomorrow, timeZone);
    return isSameDay(date, tomorrowInTimeZone);
}

/**
 * Checks if a given date is yesterday in the specified time zone.
 *
 * @param date - The date to compare.
 * @param timeZone - The time zone to consider.
 * @returns True if the date is yesterday; otherwise, false.
 */
function isYesterday(date: Date, timeZone: SelectedTimezone): boolean {
    const currentDate = new Date();
    const yesterday = subDays(currentDate, 1); // Get the date for yesterday in the current time zone
    const yesterdayInTimeZone = toZonedTime(yesterday, timeZone);
    return isSameDay(date, yesterdayInTimeZone);
}

/**
 * We have to fall back to older timezone names for native platforms that do not ship with newer timezone names to avoid a crash.
 * Memoize to prevent unnecessary calculation as timezone support will not change on runtime on a platform.
 */
const fallbackToSupportedTimezone = memoize((timezoneInput: SelectedTimezone): string => {
    try {
        const date = new Date();
        const testDate = toZonedTime(date, timezoneInput);
        format(testDate, CONST.DATE.FNS_FORMAT_STRING);
        return timezoneInput;
    } catch (error) {
        return timezoneNewToBackwardMap[timezoneInput];
    }
});

/**
 * Formats an ISO-formatted datetime string to local date and time string
 *
 * e.g.
 *
 * Jan 20 at 5:30 PM          within the past year
 * Jan 20, 2019 at 5:30 PM    anything over 1 year ago
 */
function datetimeToCalendarTime(locale: Locale, datetime: string, currentSelectedTimezone: SelectedTimezone, isLowercase = false): string {
    // Mapped once, so the isToday/isYesterday branches and the rendered string cannot resolve against different zones.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- backward IANA ids are real, just outside the tighter union.
    const mappedTimezone = fallbackToSupportedTimezone(currentSelectedTimezone) as SelectedTimezone;
    const date = getLocalDateFromDatetime(locale, mappedTimezone, datetime);
    let todayAt = translateLocalize(locale, 'common.todayAt');
    let tomorrowAt = translateLocalize(locale, 'common.tomorrowAt');
    let yesterdayAt = translateLocalize(locale, 'common.yesterdayAt');
    const at = translateLocalize(locale, 'common.conjunctionAt');
    const weekStartsOn = getWeekStartsOn(locale);

    const nowInUserZone = toZonedTime(new Date(), mappedTimezone);
    const startOfCurrentWeek = startOfWeek(nowInUserZone, {weekStartsOn});
    const endOfCurrentWeek = endOfWeek(nowInUserZone, {weekStartsOn});

    if (isLowercase) {
        todayAt = todayAt.toLowerCase();
        tomorrowAt = tomorrowAt.toLowerCase();
        yesterdayAt = yesterdayAt.toLowerCase();
    }

    const time = formatIntl(locale, 'SHORT_TIME', date);
    if (!time) {
        return '';
    }

    if (isToday(date, mappedTimezone)) {
        return `${todayAt} ${time}`;
    }
    if (isTomorrow(date, mappedTimezone)) {
        return `${tomorrowAt} ${time}`;
    }
    if (isYesterday(date, mappedTimezone)) {
        return `${yesterdayAt} ${time}`;
    }
    if (date >= startOfCurrentWeek && date <= endOfCurrentWeek) {
        const monthDay = formatIntl(locale, 'MONTH_DAY', date);
        return monthDay ? `${monthDay} ${at} ${time}` : '';
    }
    const mediumDate = formatIntl(locale, 'MEDIUM_DATE', date);
    return mediumDate ? `${mediumDate} ${at} ${time}` : '';
}

/**
 * Converts an ISO-formatted datetime string into a localized string representation
 * that's relative to current moment in time.
 *
 * e.g.
 *
 * < 1 minute ago       within the past minute
 * 12 minutes ago       within the past hour
 * 1 hour ago           within the past day
 * 3 days ago           within the past month
 * Jan 20               within the past year
 * Jan 20, 2019         anything over 1 year
 */
function datetimeToRelative(locale: Locale, datetime: string, currentSelectedTimezone: SelectedTimezone): string {
    const date = getLocalDateFromDatetime(locale, currentSelectedTimezone, datetime);
    const now = getLocalDateFromDatetime(locale, currentSelectedTimezone);
    return formatRelative(locale, date, now);
}

/** `maxCount` caps each unit, because a bare threshold lets rounding spill into the next one ("60 minutes ago"). */
const RELATIVE_TIME_UNITS: ReadonlyArray<[divisor: number, unit: Intl.RelativeTimeFormatUnit, maxCount: number]> = [
    [60, 'minute', 59],
    [3_600, 'hour', 23],
    [86_400, 'day', 29],
    [2_592_000, 'month', 11],
];

/**
 * `numeric: 'always'` to match the "1 day ago" wording date-fns shipped, rather than `'auto'`'s "yesterday".
 * Unbounded because the key space is the eleven shipped locales, but clearable for when polyfill data arrives late.
 */
function getRelativeTimeFormat(locale: Locale): Intl.RelativeTimeFormat | null {
    if (relativeTimeFormatCache.has(locale)) {
        return relativeTimeFormatCache.get(locale) ?? null;
    }
    let formatter: Intl.RelativeTimeFormat | null;
    try {
        formatter = new Intl.RelativeTimeFormat(locale, {numeric: 'always'});
    } catch (error) {
        // Engines that ship Intl but not RelativeTimeFormat (older Hermes builds, ICU-stripped runtimes) end up here.
        Log.warn('[DateUtils] Intl.RelativeTimeFormat unavailable', {locale, error});
        formatter = null;
    }
    relativeTimeFormatCache.set(locale, formatter);
    return formatter;
}

function formatRelative(locale: Locale, date: Date, now: Date): string {
    const rtf = getRelativeTimeFormat(locale);
    if (!rtf) {
        return '';
    }
    const diffSecs = (date.getTime() - now.getTime()) / 1000;
    // Invalid Date on either side yields NaN, which `RelativeTimeFormat.format` silently coerces to 0 and renders as "0 years ago".
    if (!Number.isFinite(diffSecs)) {
        return '';
    }
    const abs = Math.abs(diffSecs);
    const sign = diffSecs > 0 ? 1 : -1;
    // date-fns said "less than a minute ago", which Intl cannot express without a bespoke translation key.
    if (abs < 60) {
        return rtf.format(sign, 'minute');
    }
    // Round the magnitude before reapplying the sign, because `Math.round(-1.5)` is -1. The rounded value picks the bucket.
    for (const [divisor, unit, maxCount] of RELATIVE_TIME_UNITS) {
        const rounded = Math.round(abs / divisor);
        if (rounded <= maxCount) {
            return rtf.format(sign * rounded, unit);
        }
    }
    return rtf.format(sign * Math.round(abs / 31_536_000), 'year');
}

/**
 * Gets the zone abbreviation from the date
 *
 * e.g.
 *
 * PST
 * EST
 * GMT +07  -  For GMT timezone
 *
 * @param datetime
 * @param selectedTimezone
 * @returns
 */
function getZoneAbbreviation(datetime: string | Date, selectedTimezone: SelectedTimezone): string {
    const abbreviation = formatInTimeZoneWithFallback(datetime, selectedTimezone, 'zzz');
    if (abbreviation === 'GMT') {
        return formatInTimeZoneWithFallback(datetime, selectedTimezone, 'O');
    }
    return abbreviation;
}

/** @returns Sunday, July 9, 2023 (en) / domingo, 9 de julio de 2023 (es) */
function formatToLongDateWithWeekday(datetime: string | Date, locale: Locale): string {
    return formatIntl(locale, 'FULL_DATE', toLocalDate(datetime));
}

/** @returns Sunday (en) / domingo (es) */
function formatToDayOfWeek(datetime: Date, locale: Locale): string {
    return formatIntl(locale, 'LONG_WEEKDAY', datetime);
}

/** Locale-aware short time — 12h with AM/PM in en, 24h in es/de. @returns 2:30 PM (en) / 14:30 (es) */
function formatToLocalTime(datetime: string | Date, locale: Locale): string {
    return formatIntl(locale, 'SHORT_TIME', toLocalDate(datetime));
}

/** @returns July (en) / julio (es) */
function formatToLongMonth(datetime: Date | string, locale: Locale): string {
    return formatIntl(locale, 'LONG_MONTH', toLocalDate(datetime));
}

const THREE_HOURS = 1000 * 60 * 60 * 3;

/**
 * A throttled version of a function that updates the current date in Onyx store
 */
const updateCurrentDate = throttle(() => {
    const currentDate = format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    setCurrentDate(currentDate);
}, THREE_HOURS);

/**
 * Initialises the event listeners that trigger the current date update
 */
function startCurrentDateUpdater() {
    const trackedEvents = ['mousemove', 'touchstart', 'keydown', 'scroll'];
    for (const eventName of trackedEvents) {
        document.addEventListener(eventName, updateCurrentDate);
    }
}

function getCurrentTimezone(timezone: Timezone): Required<Timezone> {
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.automatic && timezone.selected !== currentTimezone) {
        return {...timezone, selected: currentTimezone as SelectedTimezone, automatic: timezone.automatic ?? false};
    }
    return {selected: timezone.selected ?? (CONST.DEFAULT_TIME_ZONE.selected as SelectedTimezone), automatic: timezone.automatic ?? false};
}

/** Last-resort labels for an engine with no working Intl. The translation files carry no month names. */
const FALLBACK_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

function monthNamesIn(locale: Locale): string[] {
    // Mid-month in UTC, so no timezone can shift a month-edge date into the neighboring month.
    const monthsArray = Array.from({length: 12}, (_, monthIndex) => new Date(Date.UTC(2000, monthIndex, 15)));
    return monthsArray.map((monthDate) => Str.UCFirst(formatIntl(locale, 'LONG_MONTH', monthDate)));
}

/**
 * Never add day or year to `LONG_MONTH`: that flips Intl into format context and inflects the label (ru "января").
 * Memoized for MonthPickerModal, which React Compiler does not cover. Frozen because every caller shares the instance.
 */
const getMonthNames = memoize(
    (locale: Locale): readonly string[] => {
        const names = monthNamesIn(locale);
        if (names.every(Boolean)) {
            return Object.freeze(names);
        }
        // The realistic failure is one rejected locale tag, so try the default locale before the English literal.
        const defaultNames = locale === CONST.LOCALES.DEFAULT ? names : monthNamesIn(CONST.LOCALES.DEFAULT);
        return Object.freeze(defaultNames.every(Boolean) ? defaultNames : [...FALLBACK_MONTH_NAMES]);
    },
    {maxSize: 16, equality: 'shallow'},
);

/**
 * Returns month list items for SelectionList.
 */
function getFilteredMonthItems(monthNames: readonly string[], currentMonth: number) {
    return monthNames.map((month, index) => ({
        text: month,
        value: index,
        keyForList: index.toString(),
        isSelected: index === currentMonth,
    }));
}

/**
 * Narrow rather than sliced, because Chinese long names all start with `星`.
 * @returns en ["M","T","W","T","F","S","S"], zh-hans ["一","二","三","四","五","六","日"].
 */
function getDaysOfWeekNarrow(locale: Locale): string[] {
    const weekStartsOn = getWeekStartsOn(locale);
    const reference = LOCALE_PROBE_DATE;
    return eachDayOfInterval({start: startOfWeek(reference, {weekStartsOn}), end: endOfWeek(reference, {weekStartsOn})}).map((date) => formatIntl(locale, 'NARROW_WEEKDAY', date));
}

/** CLDR field order and separator per locale, for engines without Intl. */
const FALLBACK_DATE_PLACEHOLDER_BY_LOCALE: Readonly<Record<Locale, string>> = {
    [CONST.LOCALES.EN]: 'MM/DD/YYYY',
    [CONST.LOCALES.ES]: 'DD/MM/YYYY',
    [CONST.LOCALES.FR]: 'DD/MM/YYYY',
    [CONST.LOCALES.IT]: 'DD/MM/YYYY',
    [CONST.LOCALES.PT_BR]: 'DD/MM/YYYY',
    [CONST.LOCALES.EL]: 'DD/MM/YYYY',
    [CONST.LOCALES.NL]: 'DD-MM-YYYY',
    [CONST.LOCALES.DE]: 'DD.MM.YYYY',
    [CONST.LOCALES.PL]: 'DD.MM.YYYY',
    [CONST.LOCALES.JA]: 'YYYY/MM/DD',
    [CONST.LOCALES.ZH_HANS]: 'YYYY/MM/DD',
};

/**
 * The year is widened to `YYYY` even where Intl renders it 2-digit, so en-US reads "MM/DD/YYYY" not "MM/DD/YY".
 * Memoized because DatePicker does not compile under React Compiler, so this runs on every render there.
 */
const getLocalizedDatePlaceholder = memoize(
    (locale: Locale): string => {
        const formatter = getIntlDateTimeFormat(locale, 'SHORT_DATE');
        const fallback = FALLBACK_DATE_PLACEHOLDER_BY_LOCALE[locale] ?? 'MM/DD/YYYY';
        if (!formatter) {
            return fallback;
        }
        let parts: Intl.DateTimeFormatPart[];
        const sample = new Date(2024, 11, 31);
        try {
            // `formatToParts` is absent on some ICU-stripped engines, and this runs inside DatePicker's render with no error boundary.
            parts = formatter.formatToParts(sample);
        } catch (error) {
            Log.warn('[DateUtils] Intl.DateTimeFormat.formatToParts unavailable', {locale, error});
            return fallback;
        }
        return parts
            .map((part) => {
                switch (part.type) {
                    case 'year':
                        return 'YYYY';
                    case 'month':
                        return 'MM';
                    case 'day':
                        return 'DD';
                    default:
                        return part.value;
                }
            })
            .join('');
    },
    {maxSize: 16, equality: 'shallow'},
);

// Used to throttle updates to the timezone when necessary. Initialize outside the throttle window so it's updated the first time.
let lastUpdatedTimezoneTime = subMinutes(new Date(), TIMEZONE_UPDATE_THROTTLE_MINUTES + 1);

function canUpdateTimezone(): boolean {
    const currentTime = new Date();
    const fiveMinutesAgo = subMinutes(currentTime, TIMEZONE_UPDATE_THROTTLE_MINUTES);
    // Compare the last updated time with five minutes ago
    return isBefore(lastUpdatedTimezoneTime, fiveMinutesAgo);
}

function setTimezoneUpdated() {
    lastUpdatedTimezoneTime = new Date();
}

/**
 * Get the UNIX timestamp in microseconds, with millisecond precision.
 */
function getMicroseconds(): number {
    return Date.now() * CONST.MICROSECONDS_PER_MS;
}

function getDBTimeFromDate(date: Date): string {
    return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Convert the given timestamp to the "yyyy-MM-dd HH:mm:ss" format, as expected by the database
 *
 * @param [timestamp] the given timestamp (if omitted, defaults to the current time)
 */
function getDBTime(timestamp: string | number = ''): string {
    const datetime = timestamp ? new Date(timestamp) : new Date();
    return getDBTimeFromDate(datetime);
}

function subtractMillisecondsFromDateTime(dateTime: string, milliseconds: number): string {
    const date = fromZonedTime(dateTime, 'UTC');
    const newTimestamp = subMilliseconds(date, milliseconds).valueOf();

    return getDBTime(newTimestamp);
}

function addMillisecondsFromDateTime(dateTime: string, milliseconds: number): string {
    const date = fromZonedTime(dateTime, 'UTC');
    const newTimestamp = addMilliseconds(date, milliseconds).valueOf();

    return getDBTime(newTimestamp);
}

/** Whole seconds left in a `windowMs` window that began at epoch-ms `requestedAt`. Clamped to [0, windowMs/1000]. */
function getRemainingSecondsInWindow(requestedAt: number | undefined, windowMs: number): number {
    if (!requestedAt) {
        return 0;
    }
    return Math.max(0, Math.ceil((windowMs - (Date.now() - requestedAt)) / CONST.MILLISECONDS_PER_SECOND));
}

/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getThirtyMinutesFromNow(): string {
    const date = addMinutes(new Date(), 30);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getOneHourFromNow(): string {
    const date = addHours(new Date(), 1);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getEndOfToday(): string {
    const date = endOfDay(new Date());
    return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getStartOfToday(): string {
    const date = startOfDay(new Date());
    return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getOneWeekFromNow(): string {
    const date = addDays(new Date(), 7);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * param {string} dateTimeString
 * returns {string} example: 2023-05-16
 */
function extractDate(dateTimeString: string): string {
    if (!dateTimeString) {
        return '';
    }
    if (dateTimeString === 'never') {
        return '';
    }
    const date = new Date(dateTimeString);
    return format(date, 'yyyy-MM-dd');
}

/** Pinned to en-US for round-trip stability with the time picker. @returns example: 11:10 PM */
function extractTime12Hour(dateTimeString: string, isFullFormat = false): string {
    if (!dateTimeString || dateTimeString === 'never') {
        return '';
    }
    const parsed = toLocalDate(dateTimeString);
    if (!isValid(parsed)) {
        Log.warn('[DateUtils] extractTime12Hour: unparsable datetime', {dateTimeString});
        return '';
    }
    // eslint-disable-next-line rulesdir/require-locale-for-localized-date-format -- machine round-trip parsed back by `combineDateAndTime` with the same enUS pin.
    return format(parsed, isFullFormat ? 'hh:mm:ss.SSS a' : 'hh:mm a', {locale: enUS});
}

/**
 * param {string} type - one of the values from CONST.CUSTOM_STATUS_TYPES
 * returns {string} example: 2023-05-16 11:10:00 or ''
 */
function getDateFromStatusType(type: CustomStatusTypes): string {
    switch (type) {
        case CONST.CUSTOM_STATUS_TYPES.THIRTY_MINUTES:
            return getThirtyMinutesFromNow();
        case CONST.CUSTOM_STATUS_TYPES.ONE_HOUR:
            return getOneHourFromNow();
        case CONST.CUSTOM_STATUS_TYPES.AFTER_TODAY:
            return getEndOfToday();
        case CONST.CUSTOM_STATUS_TYPES.AFTER_WEEK:
            return getOneWeekFromNow();
        case CONST.CUSTOM_STATUS_TYPES.NEVER:
            return CONST.CUSTOM_STATUS_TYPES.NEVER;
        default:
            return '';
    }
}

/**
 * @param data - either a value from CONST.CUSTOM_STATUS_TYPES or a wire-format datetime (YYYY-MM-DD HH:mm)
 * @returns localized "Today" / "Never" / locale-aware date+time string (e.g. "May 16, 2023, 11:10 PM" en / "16 may 2023, 23:10" es)
 */
function getLocalizedTimePeriodDescription(translate: LocalizedTranslate, locale: Locale, data: string): string {
    switch (data) {
        case getEndOfToday():
            return translate('statusPage.timePeriods.afterToday');
        case CONST.CUSTOM_STATUS_TYPES.NEVER:
        case '':
            return translate('statusPage.timePeriods.never');
        default:
            return formatToLocalDateTime(data, locale);
    }
}

/**
 * receive date like 2020-05-16 05:34:14 and format it to show in string like "Until 05:34 PM"
 * param {string} inputDate - Date string in 'YYYY-MM-DD HH:mm:ss' format representing the source time.
 * param {SelectedTimezone} inputDateTimeZone - Timezone in which the inputDate is provided.
 * param {SelectedTimezone} currentSelectedTimezone - Current user's timezone to display the result in.
 * returns {string} - A localized string such as 'Until 05:34 PM', 'Until tomorrow', or 'Until Jul 01 05:34 PM'.
 */
function getStatusUntilDate(translate: LocalizedTranslate, inputDate: string, inputDateTimeZone: SelectedTimezone, currentSelectedTimezone: SelectedTimezone, locale: Locale): string {
    if (!inputDate) {
        return '';
    }

    const date = fromZonedTime(inputDate, inputDateTimeZone);
    const input = toZonedTime(date, currentSelectedTimezone);
    const now = toZonedTime(new Date(), currentSelectedTimezone);
    const endOfToday = endOfDay(now);

    // If the date is adjusted to the following day
    if (isSameSecond(input, endOfToday)) {
        return translate('statusPage.untilTomorrow');
    }

    // Pass UTC `date` + explicit `currentSelectedTimezone` so wall-clock matches the target zone (not the runtime default).
    const time = formatIntl(locale, 'SHORT_TIME', date, currentSelectedTimezone);
    if (!time) {
        return '';
    }

    // If it's a time on the same date
    if (isSameDay(input, now)) {
        return translate('statusPage.untilTime', time);
    }

    // If it's further in the future than tomorrow but within the same year
    if (isAfter(input, now) && isSameYear(input, now)) {
        const monthDay = formatIntl(locale, 'MONTH_DAY', date, currentSelectedTimezone);
        return monthDay ? translate('statusPage.untilTime', `${monthDay} ${time}`) : '';
    }

    // If it's in another year
    const mediumDate = formatIntl(locale, 'MEDIUM_DATE', date, currentSelectedTimezone);
    return mediumDate ? translate('statusPage.untilTime', `${mediumDate} ${time}`) : '';
}

/**
 * Update the time for a given date.
 *
 * param {string} updatedTime - Time in "hh:mm A" or "HH:mm:ss" or "yyyy-MM-dd HH:mm:ss" format.
 * param {string} inputDateTime - Date in "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD" format.
 * returns {string} - Date with updated time in "YYYY-MM-DD HH:mm:ss" format.
 */
const combineDateAndTime = (updatedTime: string, inputDateTime: string): string => {
    if (!updatedTime || !inputDateTime) {
        return '';
    }

    let parsedTime: Date | null = null;
    if (updatedTime.includes('-')) {
        // it's in "yyyy-MM-dd HH:mm:ss" format
        const tempTime = parse(updatedTime, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (isValid(tempTime)) {
            parsedTime = tempTime;
        }
    } else if (updatedTime.includes(':')) {
        // it's in "hh:mm a" format (pinned to en-US so the parse stays stable across user-locale changes)
        const tempTime = parse(updatedTime, 'hh:mm a', new Date(), {locale: enUS});
        if (isValid(tempTime)) {
            parsedTime = tempTime;
        }
    }

    if (!parsedTime) {
        return '';
    }

    let parsedDateTime: Date | null = null;
    if (inputDateTime.includes(':')) {
        // Check if it includes time
        const tempDateTime = parse(inputDateTime, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (isValid(tempDateTime)) {
            parsedDateTime = tempDateTime;
        }
    } else {
        const tempDateTime = parse(inputDateTime, 'yyyy-MM-dd', new Date());
        if (isValid(tempDateTime)) {
            parsedDateTime = tempDateTime;
        }
    }

    if (!parsedDateTime) {
        return '';
    }

    const updatedDateTime = set(parsedDateTime, {
        hours: parsedTime.getHours(),
        minutes: parsedTime.getMinutes(),
        seconds: parsedTime.getSeconds(),
    });

    return format(updatedDateTime, 'yyyy-MM-dd HH:mm:ss');
};

type TwelveHourTimeObject = {hour: string; minute: string; seconds: string; milliseconds: string; period: ValueOf<typeof CONST.TIME_PERIOD>};

/** Frozen: this single object seeds every TimePicker's initial state, so a mutation would change the default for the rest of the session. */
const EMPTY_TWELVE_HOUR_TIME: Readonly<TwelveHourTimeObject> = Object.freeze({hour: '12', minute: '00', seconds: '00', milliseconds: '000', period: CONST.TIME_PERIOD.PM});

/**
 * Parses a `hh:mm a` (or `hh:mm:ss.SSS a`) string into its parts. Returns `undefined` on unparsable input, so the
 * fallback is the caller's choice rather than a noon baked into the parser. The `enUS` pin and the hour-derived period
 * keep the output on English AM/PM whatever the user's locale, which is what the time picker round-trips.
 * example {hour: '11', minute: '10', seconds: '10', milliseconds: '123', period: 'AM'}
 */
function get12HourTimeObjectFromDate(dateTime: string, isFullFormat = false): TwelveHourTimeObject | undefined {
    if (!dateTime) {
        return undefined;
    }
    const parsedTime = parse(dateTime, isFullFormat ? 'hh:mm:ss.SSS a' : 'hh:mm a', new Date(), {locale: enUS});
    if (!isValid(parsedTime)) {
        Log.warn('[DateUtils] get12HourTimeObjectFromDate: unparsable time value', {dateTime});
        return undefined;
    }
    return {
        hour: format(parsedTime, 'hh'),
        minute: format(parsedTime, 'mm'),
        seconds: isFullFormat ? format(parsedTime, 'ss') : '00',
        milliseconds: isFullFormat ? format(parsedTime, 'SSS') : '000',
        period: parsedTime.getHours() >= 12 ? CONST.TIME_PERIOD.PM : CONST.TIME_PERIOD.AM,
    };
}

/**
 * Checks if the time input is at least one minute in the future.
 * param {String} timeString: '04:24 AM'
 * param {String} dateTimeString: '2023-11-14 14:24:00'
 * returns {Boolean}
 */
const isTimeAtLeastOneMinuteInFuture = ({timeString, dateTimeString}: {timeString?: string; dateTimeString: string}): boolean => {
    let dateToCheck = dateTimeString;
    if (timeString) {
        dateToCheck = combineDateAndTime(timeString, dateTimeString);
    }

    // Get current date and time
    const now = new Date();

    // Check if the combinedDate is at least one minute later than the current date and time
    return isAfter(new Date(dateToCheck), addMinutes(now, 1));
};

/**
 * Checks if the time range input is valid.
 * param {String} startTime: '2023-11-14 12:24:00'
 * param {String} endTime: '2023-11-14 14:24:00'
 * returns {Boolean}
 */
const isValidStartEndTimeRange = ({startTime, endTime}: {startTime: string; endTime: string}): boolean => {
    // Check if the combinedDate is at least one minute later than the current date and time
    return isAfter(new Date(endTime), new Date(startTime));
};

/**
 * Checks if the input date is in the future compared to the reference date.
 * param {Date} inputDate - The date to validate.
 * param {Date} referenceDate - The date to compare against.
 * returns {string} - Returns an error key if validation fails, otherwise an empty string.
 */
const getDayValidationErrorKey = (translate: LocalizedTranslate, inputDate: Date): string => {
    if (!inputDate) {
        return '';
    }

    if (isAfter(startOfDay(new Date()), startOfDay(inputDate))) {
        return translate('common.error.invalidDateShouldBeFuture');
    }
    return '';
};

/**
 * Checks if the input time is after the reference date
 * param {Date} inputDate - The date to validate.
 * returns {boolean} - Returns true if the input date is after the reference date, otherwise false.
 */
const isFutureDay = (inputDate: Date): boolean => {
    return isAfter(startOfDay(inputDate), startOfDay(new Date()));
};

/**
 * Checks if the input time is at least one minute in the future compared to the reference time.
 * param {Date} inputTime - The time to validate.
 * param {Date} referenceTime - The time to compare against.
 * returns {string} - Returns an error key if validation fails, otherwise an empty string.
 */
const getTimeValidationErrorKey = (translate: LocalizedTranslate, inputTime: Date): string => {
    const timeNowPlusOneMinute = addMinutes(new Date(), 1);
    if (isBefore(inputTime, timeNowPlusOneMinute)) {
        return translate('common.error.invalidTimeShouldBeFuture');
    }
    return '';
};

/**
 * Machine-readable output only, e.g. a `yyyy-MM-dd` sent to the API or used as a key.
 * Anything a user reads goes through the locale-aware `formatTo*` / `formatIn*` helpers instead.
 */
function formatMachineDateWithUTCTimeZone(datetime: string, dateFormat: MachineDateFormat = CONST.DATE.FNS_FORMAT_STRING) {
    const date = toDate(datetime, {timeZone: 'UTC'});

    if (isValid(date)) {
        return tzFormat(toZonedTime(date, 'UTC'), dateFormat);
    }

    return '';
}

/**
 *
 * @param timezone
 * Convert unsupported old timezone to app supported timezone
 * @returns Timezone
 */
function formatToSupportedTimezone(timezoneInput: Timezone): Timezone {
    if (!timezoneInput?.selected) {
        return timezoneInput;
    }
    return {
        selected: timezoneBackwardToNewMap[timezoneInput.selected] ?? timezoneInput.selected,
        automatic: timezoneInput.automatic,
    };
}

/**
 * Returns the last business day of given date month
 *
 * param {Date} inputDate
 * returns {number}
 */
function getLastBusinessDayOfMonth(inputDate: Date): number {
    let currentDate = endOfMonth(inputDate);
    const dayOfWeek = getDay(currentDate);

    if (dayOfWeek === 0) {
        currentDate = subDays(currentDate, 2);
    } else if (dayOfWeek === 6) {
        currentDate = subDays(currentDate, 1);
    }

    return getDate(currentDate);
}

/**
 * Field order is a property of the locale, not of any date, so a fixed reference day answers it and the result caches.
 */
const isDayBeforeMonth = memoize(
    (locale: Locale): boolean => {
        const formatter = getIntlDateTimeFormat(locale, 'MONTH_DAY');
        if (!formatter) {
            return false;
        }
        let parts: Intl.DateTimeFormatPart[];
        try {
            // `formatToParts` is absent on some ICU-stripped engines, and this runs on the trip-preview render path.
            parts = formatter.formatToParts(LOCALE_PROBE_DATE);
        } catch (error) {
            Log.warn('[DateUtils] Intl.DateTimeFormat.formatToParts unavailable', {locale, error});
            return false;
        }
        const dayIndex = parts.findIndex((part) => part.type === 'day');
        const monthIndex = parts.findIndex((part) => part.type === 'month');
        return dayIndex > -1 && monthIndex > -1 && dayIndex < monthIndex;
    },
    {maxSize: 16, equality: 'shallow'},
);

/**
 * Returns a formatted date range from date 1 to date 2.
 * Dates are formatted as follows:
 * 1. When both dates refer to the same day: Mar 17
 * 2. When both dates refer to the same month: Mar 17-20 (en) / 17-20 mar (es)
 * 3. When both dates refer to the same year: Feb 28 to Mar 1
 * 4. When the dates are from different years: Dec 28, 2023 to Jan 5, 2024
 */
function joinRange(startPart: string, endPart: string, separator: string): string {
    return startPart && endPart ? `${startPart}${separator}${endPart}` : '';
}

function getFormattedDateRange(translate: LocalizedTranslate, date1: Date, date2: Date, locale: Locale): string {
    const to = ` ${translate('common.to').toLocaleLowerCase(locale)} `;
    if (isSameDay(date1, date2)) {
        // Dates are from the same day
        return formatIntl(locale, 'MONTH_DAY', date1);
    }
    if (isSameMonth(date1, date2)) {
        const isDayFirst = isDayBeforeMonth(locale);
        const startPart = isDayFirst ? formatIntl(locale, 'DAY_ONLY', date1) : formatIntl(locale, 'MONTH_DAY', date1);
        const endPart = isDayFirst ? formatIntl(locale, 'MONTH_DAY', date2) : formatIntl(locale, 'DAY_ONLY', date2);
        return joinRange(startPart, endPart, '-');
    }
    if (isSameYear(date1, date2)) {
        // Dates are in the same year, differ by months
        return joinRange(formatIntl(locale, 'MONTH_DAY', date1), formatIntl(locale, 'MONTH_DAY', date2), to);
    }
    // Dates differ by years, months, days
    return joinRange(formatIntl(locale, 'MEDIUM_DATE', date1), formatIntl(locale, 'MEDIUM_DATE', date2), to);
}

/**
 * Returns a formatted date range from date 1 to date 2 of a reservation.
 * Dates are formatted as follows:
 * 1. When both dates refer to the same day and the current year: Sunday, Mar 17
 * 2. When both dates refer to the same day but not the current year: Wednesday, Mar 17, 2023
 * 3. When both dates refer to the current year: Sunday, Mar 17 to Wednesday, Mar 20
 * 4. When the dates are from different years or from a year which is not current: Wednesday, Mar 17, 2023 to Saturday, Jan 20, 2024
 */
function getFormattedReservationRangeDate(translate: LocalizedTranslate, date1: Date, date2: Date, locale: Locale): string {
    if (isSameDay(date1, date2) && isThisYear(date1)) {
        // Dates are from the same day
        return formatIntl(locale, 'WEEKDAY_MONTH_DAY', date1);
    }
    if (isSameDay(date1, date2)) {
        // Dates are from the same day but not this year
        return formatIntl(locale, 'WEEKDAY_MONTH_DAY_YEAR', date1);
    }
    const to = ` ${translate('common.conjunctionTo')} `;
    if (isSameYear(date1, date2) && isThisYear(date1)) {
        // Dates are in the current year, differ by months
        return joinRange(formatIntl(locale, 'WEEKDAY_MONTH_DAY', date1), formatIntl(locale, 'WEEKDAY_MONTH_DAY', date2), to);
    }
    // Dates differ by years, months, days or only by months but the year is not current
    return joinRange(formatIntl(locale, 'WEEKDAY_MONTH_DAY_YEAR', date1), formatIntl(locale, 'WEEKDAY_MONTH_DAY_YEAR', date2), to);
}

/**
 * Returns a formatted date of departure.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Departs on Sunday, Mar 17 at 8:00.
 * 2. When the date refers not to the current year: Departs on Wednesday, Mar 17, 2023 at 8:00.
 */
function getFormattedTransportDate(translate: LocalizedTranslate, date: Date, locale: Locale): string {
    const {date: datePart, hour} = getFormattedTransportDateAndHour(date, locale);
    if (!datePart || !hour) {
        return '';
    }
    return `${translate('travel.departs')} ${datePart} ${translate('common.conjunctionAt')} ${hour}`;
}

/**
 * Returns a formatted flight date and hour.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Wednesday, Mar 17 8:00 AM
 * 2. When the date refers not to the current year: Wednesday, Mar 17, 2023 8:00 AM
 */
function formatWeekdayDateAndTime(locale: Locale, date: Date, isCurrentYear: boolean, timeZone?: string): {date: string; hour: string} | undefined {
    const datePart = formatIntl(locale, isCurrentYear ? 'WEEKDAY_MONTH_DAY' : 'WEEKDAY_MONTH_DAY_YEAR', date, timeZone);
    const hour = formatIntl(locale, 'SHORT_TIME', date, timeZone);
    return datePart && hour ? {date: datePart, hour} : undefined;
}

function getFormattedTransportDateAndHour(date: Date, locale: Locale): {date: string; hour: string} {
    return formatWeekdayDateAndTime(locale, date, isThisYear(date)) ?? {date: '', hour: ''};
}

/**
 * Returns a human-readable timezone label for an ISO offset (e.g. `+07:00` -> `GMT+7`, `+00:00` -> `UTC`).
 */
function getCancellationDateTimezoneLabel(venueTimezone: string): string {
    const match = venueTimezone.match(/^([+-])(\d{2}):(\d{2})$/);
    if (!match) {
        return 'UTC';
    }
    const [, sign, hours, minutes] = match;
    const hoursNumber = Number(hours);
    const minutesNumber = Number(minutes);
    if (hoursNumber === 0 && minutesNumber === 0) {
        return 'UTC';
    }
    return `GMT${sign}${hoursNumber}${minutesNumber > 0 ? `:${minutes}` : ''}`;
}

/**
 * Captures the trailing offset so this helper can do the shift itself. Matches a bare `±HH` too, because the offset is
 * stripped before parsing, so shapes `new Date` would reject still work here.
 */
const CANCELLATION_OFFSET_PATTERN = /([+-])(\d{2}):?(\d{2})?$/;

/**
 * Returns a formatted cancellation date, preserving the venue's timezone from the ISO string offset.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Wednesday, Mar 17 8:00 AM, GMT+7
 * 2. When the date refers not to the current year: Wednesday, Mar 17, 2023 8:00 AM, GMT+7
 */
function getFormattedCancellationDate(isoDateString: string, locale: Locale, now: Date = new Date()): string {
    if (!isoDateString) {
        return '';
    }
    // Gate on a `:` from a time component — otherwise `'2026-04-19'` matches trailing `-19` as a spurious GMT-19 offset.
    const offsetMatch = isoDateString.includes(':') ? isoDateString.match(CANCELLATION_OFFSET_PATTERN) : null;
    const [, sign = '+', hours = '00', minutes = '00'] = offsetMatch ?? [];
    const offsetMinutes = offsetMatch ? (sign === '-' ? -1 : 1) * (Number(hours) * 60 + Number(minutes)) : 0;
    const venueTimezoneLabel = offsetMatch ? getCancellationDateTimezoneLabel(`${sign}${hours}:${minutes}`) : 'UTC';
    // Parse the civil part explicitly rather than appending `Z` and handing the result to `new Date`. Shapes like
    // `'2026-04-19Z'` and `'...+07'` are outside the Date Time String Format, so acceptance is implementation-defined:
    // V8 takes them via legacy heuristics and Hermes does not, which blanked the whole label on device.
    const civil = offsetMatch ? isoDateString.slice(0, offsetMatch.index) : isoDateString.replace(/Z$/, '');
    const instant = toUTCDate(civil);
    if (Number.isNaN(instant.getTime())) {
        return '';
    }
    // `instant` already holds the venue wall-clock, so formatting it in UTC cannot contradict `venueTimezoneLabel`.
    const nowInVenue = new Date(now.getTime() + offsetMinutes * 60_000);
    const parts = formatWeekdayDateAndTime(locale, instant, instant.getUTCFullYear() === nowInVenue.getUTCFullYear(), 'UTC');
    if (!parts) {
        return '';
    }
    return `${parts.date} ${parts.hour}, ${venueTimezoneLabel}`;
}

/**
 * Returns a formatted layover duration in format "2h 30m".
 */
function getFormattedDurationBetweenDates(translateParam: LocaleContextProps['translate'], start: Date, end: Date): string | undefined {
    const {days, hours, minutes} = intervalToDuration({start, end});

    if (days && days > 0) {
        return;
    }

    return `${hours ? `${hours}${translateParam('common.hourAbbreviation')} ` : ''}${minutes}${translateParam('common.minuteAbbreviation')}`;
}

function getFormattedDuration(translateParam: LocaleContextProps['translate'], durationInSeconds: number): string {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);

    return `${hours ? `${hours}${translateParam('common.hourAbbreviation')} ` : ''}${minutes}${translateParam('common.minuteAbbreviation')}`;
}

const TIME_UNIT_PADDING = 2; // Pad time units to 2 digits (e.g., "09" instead of "9")

/**
 * Formats a countdown timer with hours, minutes, and seconds (e.g., "23h : 59m : 59s").
 */
function formatCountdownTimer(translateParam: LocaleContextProps['translate'], hours: number, minutes: number, seconds: number): string {
    const paddedMinutes = minutes.toString().padStart(TIME_UNIT_PADDING, '0');
    const paddedSeconds = seconds.toString().padStart(TIME_UNIT_PADDING, '0');

    return `${hours}${translateParam('common.hourAbbreviation')} : ${paddedMinutes}${translateParam('common.minuteAbbreviation')} : ${paddedSeconds}${translateParam('common.secondAbbreviation')}`;
}

const WIRE_YEAR_PREFIX = /^(\d{4})/;

function doesDateBelongToAPastYear(date: string): boolean {
    // Read the year off the wire string, so a Dec 31 transaction viewed that evening (already Jan 1 in UTC) is not
    // suffixed with a year on what is still today's row.
    const yearMatch = date.match(WIRE_YEAR_PREFIX);
    const transactionYear = yearMatch ? Number(yearMatch[1]) : toUTCDate(date).getUTCFullYear();
    // Local on the "now" side: the question is whether this differs from the year the viewer is currently in, and a
    // UTC "now" would put a Dec 31 evening in the Americas into next year, which is what the line above guards against.
    return transactionYear !== new Date().getFullYear();
}

/**
 * Returns a boolean value indicating whether the card has expired.
 * @param expiryMonth month when card expires (starts from 1 so can be any number between 1 and 12)
 * @param expiryYear year when card expires
 */

function isCardExpired(expiryMonth: number, expiryYear: number): boolean {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    return expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth);
}

/**
 * Returns the difference in the number of days from the provided date to/from now.
 * @param - The date to compare.
 * @returns The difference in days as an integer.
 */
function getDifferenceInDaysFromNow(date: Date) {
    return differenceInDays(new Date(), date);
}

/**
 * Returns a boolean value indicating whether the provided date string can be parsed as a valid date.
 * @param dateString string
 * @returns True if the date string is valid, otherwise false.
 */
function isValidDateString(dateString: string) {
    const date = new Date(dateString);
    return !Number.isNaN(date.getTime());
}

/** Persists to backend as `merchant`; pinned to enUS so the wire string is byte-stable across engines. */
function getStablePerDiemMerchantDateRange(date1: Date, date2: Date): string {
    // eslint-disable-next-line rulesdir/require-locale-for-localized-date-format -- wire format, not a user-visible render.
    return `${format(date1, 'MMM d, yyyy', {locale: enUS})} - ${format(date2, 'MMM d, yyyy', {locale: enUS})}`;
}

/**
 * Returns a formatted date range with the number of days in the range.
 * Format: "YYYY-MM-DD to YYYY-MM-DD (X days)"
 */
function getFormattedSplitDateRange(translateParam: LocaleContextProps['translate'], startDate: string | undefined, endDate: string | undefined): string {
    if (!startDate || !endDate) {
        return '';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = differenceInDays(end, start) + 1;

    return translateParam('iou.splitDateRange', startDate, endDate, daysCount);
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
/** DB wire timestamp: `yyyy-MM-dd HH:mm:ss[.SSS]` — no timezone, so JS `new Date()` parses it as local wall-clock. */
const DB_WIRE_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;
/** T-separated ISO without a Z or `±HH:MM` offset. ECMA-262 parses it as local wall-clock, the same trap as the DB wire timestamp above. */
const ISO_LOCAL_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;
function isUnzonedString(date: unknown): date is string {
    return typeof date === 'string' && (ISO_DATE_PATTERN.test(date) || DB_WIRE_TIMESTAMP_PATTERN.test(date) || ISO_LOCAL_DATETIME_PATTERN.test(date));
}

/** Local midnight. Use `toUTCDate` when the result feeds a UTC-zone formatter, or the day shifts east of UTC. */
function toLocalDate(date: Date | string): Date {
    if (typeof date !== 'string') {
        return date;
    }
    if (ISO_DATE_PATTERN.test(date)) {
        return parse(date, 'yyyy-MM-dd', new Date());
    }
    // Space-separated DB timestamps: V8 accepts the shape, Hermes rejects it, so parse explicitly rather than relying on engine leniency.
    if (DB_WIRE_TIMESTAMP_PATTERN.test(date)) {
        // The pattern admits any precision and some backends send microseconds, but date-fns rejects unconsumed characters.
        const fraction = /\.(\d+)$/.exec(date)?.[1];
        let wireFormat = 'yyyy-MM-dd HH:mm';
        if (fraction) {
            wireFormat = `yyyy-MM-dd HH:mm:ss.${'S'.repeat(fraction.length)}`;
        } else if (date.length > 16) {
            wireFormat = 'yyyy-MM-dd HH:mm:ss';
        }
        return parse(date, wireFormat, new Date());
    }
    return new Date(date);
}

/**
 * UTC-anchored. A `Date` is re-read as the calendar fields it displays locally, which is what the date-only callers
 * want and an instant-valued caller does not: pass those a string.
 */
function toUTCDate(date: Date | string): Date {
    if (typeof date !== 'string') {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
    }
    if (ISO_DATE_PATTERN.test(date)) {
        return new Date(`${date}T00:00:00Z`);
    }
    // DB timestamps (`yyyy-MM-dd HH:mm:ss[.SSS]`) must parse as UTC; local parsing shifts the calendar day backward for UTC+ viewers.
    return toDate(date, {timeZone: 'UTC'});
}

/** @returns March 1, 2025 (en) / 1 de marzo de 2025 (es) */
function formatToReadableString(date: Date | string, locale: Locale): string {
    return formatIntl(locale, 'LONG_DATE', toLocalDate(date));
}

/** @returns July 2025 (en) / julio de 2025 (es) */
function formatToLongMonthYear(date: Date | string, locale: Locale): string {
    return formatIntl(locale, 'LONG_MONTH_YEAR', toLocalDate(date));
}

/** @returns Wednesday, July 9, 2025 (en) / miércoles, 9 de julio de 2025 (es) */
function formatToWeekdayLongDate(date: Date | string, locale: Locale): string {
    return formatIntl(locale, 'WEEKDAY_LONG_MONTH_DAY_YEAR', toLocalDate(date));
}

/** @returns Jul 9, 2:30 PM (en) / 9 jul, 14:30 (es) */
function formatToShortMonthDayTime(date: Date | string, locale: Locale): string {
    return formatIntl(locale, 'MONTH_DAY_SHORT_TIME', toLocalDate(date));
}

/** @returns Jul 9, 2023 (en) / 9 jul 2023 (es) */
function formatToMediumDate(date: Date | string, locale: Locale): string {
    return formatIntl(locale, 'MEDIUM_DATE', toLocalDate(date));
}

/**
 * Padded short-date matching `getLocalizedDatePlaceholder` field order + separator; UTC-anchored.
 * @returns en → "01/05/2026"; de → "05.01.2026"; ja → "2026/01/05".
 */
function formatToLocalizedShortDate(date: Date | string, locale: Locale): string {
    return formatIntl(locale, 'SHORT_DATE_PADDED', toUTCDate(date), 'UTC');
}

/** @returns Jul 9, 2023, 2:30 PM (en) / 9 jul 2023, 14:30 (es) */
function formatToLocalDateTime(dateTime: Date | string, locale: Locale): string {
    if (!dateTime) {
        return '';
    }
    return formatIntl(locale, 'MEDIUM_DATE_TIME', toLocalDate(dateTime));
}

/**
 * UTC-anchored medium date. Use for date-only / UTC-stored values that must render the same calendar
 * day for every viewer regardless of their local timezone.
 */
function formatInUTCToMedium(date: Date | string, locale: Locale): string {
    if (!date) {
        return '';
    }
    return formatIntl(locale, 'MEDIUM_DATE', toUTCDate(date), 'UTC');
}

/** UTC-anchored Jul 9 (en) / 9 jul (es), no year. */
function formatInUTCToShort(date: Date | string, locale: Locale): string {
    if (!date) {
        return '';
    }
    return formatIntl(locale, 'MONTH_DAY', toUTCDate(date), 'UTC');
}

/** UTC-anchored July 9, 2023 (en) / 9 de julio de 2023 (es). */
function formatInUTCToLong(date: Date | string, locale: Locale): string {
    if (!date) {
        return '';
    }
    return formatIntl(locale, 'LONG_DATE', toUTCDate(date), 'UTC');
}

/** Transaction-list convention: MEDIUM ("Jul 9, 2023") for past years, SHORT ("Jul 9") for current. UTC-anchored — use for calendar dates (transaction date, posted) so the day never shifts by viewer timezone. */
function formatTransactionListDate(date: string, locale: Locale): string {
    if (!date) {
        return '';
    }
    return doesDateBelongToAPastYear(date) ? formatInUTCToMedium(date, locale) : formatInUTCToShort(date, locale);
}

/** @returns Jul 9 (en) / 9 jul (es) — locale-aware month-day, no year. */
function formatToShortMonthDay(date: Date | string, locale: Locale): string {
    return formatIntl(locale, 'MONTH_DAY', toLocalDate(date));
}

/** Full ISO timestamp only. Date-only `'yyyy-MM-dd'` would silently day-shift on timezone application — use `formatToReadableString` or `formatInUTCToLong` instead. */
function formatInTimeZoneToLong(date: Date | string, timeZone: SelectedTimezone, locale: Locale): string {
    if (!date) {
        return '';
    }
    if (isUnzonedString(date)) {
        Log.warn('[DateUtils] formatInTimeZoneToLong: unzoned string would parse as runtime-local wall-clock; use formatToReadableString or formatInUTCToLong', {date});
        return '';
    }
    return formatIntl(locale, 'LONG_DATE', toLocalDate(date), timeZone);
}

/** Full ISO timestamp only. @returns Jul 9, 2025 (en) / 9 jul 2025 (es) */
function formatInTimeZoneToMediumDate(date: Date | string, timeZone: SelectedTimezone, locale: Locale): string {
    if (!date) {
        return '';
    }
    if (isUnzonedString(date)) {
        Log.warn('[DateUtils] formatInTimeZoneToMediumDate: unzoned string would parse as runtime-local wall-clock; use formatToMediumDate', {date});
        return '';
    }
    return formatIntl(locale, 'MEDIUM_DATE', toLocalDate(date), timeZone);
}

/** Full ISO timestamp only. */
function formatInTimeZoneToShortTime(date: Date | string, timeZone: SelectedTimezone, locale: Locale): string {
    if (!date) {
        return '';
    }
    if (isUnzonedString(date)) {
        Log.warn('[DateUtils] formatInTimeZoneToShortTime: unzoned string would parse as runtime-local wall-clock; pass a zoned Date or full ISO with offset', {date});
        return '';
    }
    return formatIntl(locale, 'SHORT_TIME', toLocalDate(date), timeZone);
}

/** Full ISO timestamp only. */
function formatInTimeZoneToWeekday(date: Date | string, timeZone: SelectedTimezone, locale: Locale): string {
    if (!date) {
        return '';
    }
    if (isUnzonedString(date)) {
        Log.warn('[DateUtils] formatInTimeZoneToWeekday: unzoned string would parse as runtime-local wall-clock; use formatToReadableString', {date});
        return '';
    }
    return formatIntl(locale, 'LONG_WEEKDAY', toLocalDate(date), timeZone);
}

/**
 * Retries with the backward-mapped IANA on platforms rejecting newer zone IDs (older iOS/macOS);
 * falls back to UTC + warn rather than throwing — render-path callers have no error boundaries.
 */
function formatInTimeZoneWithFallback(date: Date | string | number, timeZone: string, formatStr: string, options?: Parameters<typeof formatInTimeZone>[3]): string {
    // Validation only, via `formatInTimeZone`'s own parser, since `new Date` rejects the wire shape on Hermes. The
    // original value is what gets formatted below, because date-fns-tz reads an unzoned string as runtime-local.
    const validationDate = typeof date === 'string' ? toDate(date) : date;
    // An invalid date throws in every timezone, so the UTC fallback below cannot rescue it. Bail before trying.
    if (!isValid(validationDate)) {
        Log.warn('[DateUtils] formatInTimeZoneWithFallback received an invalid date', {date, timeZone});
        return '';
    }
    try {
        return formatInTimeZone(date, timeZone, formatStr, options);
    } catch (error) {
        const backwardTimeZone = isKnownTimezone(timeZone) ? timezoneNewToBackwardMap[timeZone] : undefined;
        if (backwardTimeZone) {
            try {
                Log.warn('[DateUtils] formatInTimeZone failed; falling back to backward-mapped timezone', {timeZone, backwardTimeZone, error});
                return formatInTimeZone(date, backwardTimeZone, formatStr, options);
            } catch (retryError) {
                Log.warn('[DateUtils] formatInTimeZone retry with backward-mapped timezone also failed; rendering in UTC', {timeZone, backwardTimeZone, retryError});
            }
        } else {
            Log.warn('[DateUtils] formatInTimeZone failed and no backward mapping exists; rendering in UTC', {timeZone, error});
        }
        try {
            return formatInTimeZone(date, 'UTC', formatStr, options);
        } catch (utcError) {
            // This helper exists so render paths with no error boundary can call it. If UTC fails too there is nothing
            // left to try, and an empty string is what every other formatter here returns when it cannot render.
            Log.warn('[DateUtils] formatInTimeZone failed in UTC as well', {timeZone, utcError});
            return '';
        }
    }
}

/**
 * Converts a UTC datetime string to a date string (yyyy-MM-dd) in the target timezone.
 * @param utcDateTime - Datetime string in UTC format (yyyy-MM-dd HH:mm:ss or yyyy-MM-dd HH:mm:ss.SSS)
 * @param timeZone - Target timezone to display the date in
 * @returns Date string in yyyy-MM-dd format, or empty string if invalid
 */
function formatUTCDateTimeToDateInTimezone(utcDateTime: string, timeZone: SelectedTimezone | undefined, formatStr = CONST.DATE.FNS_FORMAT_STRING): string {
    if (!utcDateTime || !timeZone) {
        return '';
    }
    try {
        const date = toDate(utcDateTime, {timeZone: 'UTC'});
        return formatInTimeZoneWithFallback(date, timeZone, formatStr);
    } catch (error) {
        Log.warn('[DateUtils] Failed to format UTC datetime to timezone', {utcDateTime, timeZone, error});
        return '';
    }
}

/**
 * Formats the violation snapshot start date for display in the user's timezone.
 */
function formatViolationSnapshotStartedAtDate(violationSnapshotStartedAt: string, timeZone: SelectedTimezone | undefined, preferredLocale: Locale): string {
    if (!violationSnapshotStartedAt || !timeZone) {
        return '';
    }

    try {
        const date = toDate(violationSnapshotStartedAt, {timeZone: 'UTC'});
        // A date-only payload is a calendar day, not an instant, so render it in UTC where `timeZone` cannot shift the
        // day. Matched against the shape, not against a space: a T-separated instant has no space either.
        const isDateOnly = ISO_DATE_PATTERN.test(violationSnapshotStartedAt);
        return formatIntl(preferredLocale, 'LONG_DATE', date, isDateOnly ? 'UTC' : timeZone);
    } catch (error) {
        Log.warn('[DateUtils] Failed to format violation snapshot started at date', {violationSnapshotStartedAt, timeZone, error});
        return '';
    }
}

/**
 * Backend expects datetime format without milliseconds in some cases (yyyy-MM-dd HH:mm:ss)
 */
function formatDBTimeWithoutMilliseconds(timestamp: number): string {
    return getDBTime(timestamp).replace(/\.\d{3}$/, '');
}

/**
 * Convert a date to UTC by taking midnight (00:00:00) in the user's local timezone and expressing it as a UTC timestamp
 */

const normalizeDateToStartOfDay = (fromDate: string, timeZone: SelectedTimezone | undefined): string => {
    const localDate = parse(fromDate, CONST.DATE.FNS_FORMAT_STRING, new Date());
    const midnightLocal = startOfDay(localDate);
    return formatDBTimeWithoutMilliseconds(fromZonedTime(midnightLocal, timeZone ?? 'UTC').valueOf());
};

/**
 * Convert a date to UTC by taking end of day (23:59:59) in the user's local timezone and expressing it as a UTC timestamp
 */
const normalizeDateToEndOfDay = (thruDate: string, timeZone: SelectedTimezone | undefined): string => {
    const localDate = parse(thruDate, CONST.DATE.FNS_FORMAT_STRING, new Date());
    const endOfDayLocal = endOfDay(localDate);
    return formatDBTimeWithoutMilliseconds(fromZonedTime(endOfDayLocal, timeZone ?? 'UTC').valueOf());
};

/**
 * Returns the start and end dates of a month in the format yyyy-MM-dd.
 * @param year - Year (e.g., 2025)
 * @param month - Month (1-12, where 1 is January)
 */
function getMonthDateRange(year: number, month: number): {start: string; end: string} {
    return {
        start: format(new Date(year, month - 1, 1), 'yyyy-MM-dd'),
        end: format(new Date(year, month, 0), 'yyyy-MM-dd'),
    };
}

/**
 * Returns the start and end dates of a week in the format yyyy-MM-dd.
 * @param weekStartDate - Week start date string in YYYY-MM-DD format
 */
function getWeekDateRange(weekStartDate: string): {start: string; end: string} {
    // Parse the date string as a local date to avoid timezone issues
    // Using parse with explicit format ensures it's treated as local time, not UTC
    // This prevents dates like '2026-01-25' from being interpreted as UTC midnight
    // which would shift to the previous day in timezones behind UTC (e.g., PST)
    const weekStart = parse(weekStartDate, 'yyyy-MM-dd', new Date());
    const weekEnd = addDays(weekStart, 6);
    return {
        start: format(weekStart, 'yyyy-MM-dd'),
        end: format(weekEnd, 'yyyy-MM-dd'),
    };
}

/**
 * Checks if a date string (yyyy-MM-dd or yyyy-MM-dd HH:mm:ss) falls within a specific month.
 * Uses string comparison to avoid timezone issues.
 *
 * @param dateString - Date string in format yyyy-MM-dd or yyyy-MM-dd HH:mm:ss
 * @param year - Year (e.g., 2025)
 * @param month - Month (1-12, where 1 is January)
 */
function isDateStringInMonth(dateString: string, year: number, month: number): boolean {
    const datePart = dateString.substring(0, 10);
    const {start: monthStart, end: monthEnd} = getMonthDateRange(year, month);

    // String comparison works because yyyy-MM-dd format is lexicographically sortable
    return datePart >= monthStart && datePart <= monthEnd;
}

/**
 * Returns a formatted date range.
 */
function getFormattedDateRangeForSearch(startDate: string, endDate: string, shouldShowFullYear: boolean, shouldOmitCurrentYear: boolean, locale: Locale): string {
    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());
    let startFormat: IntlFormatKey = 'MONTH_DAY';
    let endFormat: IntlFormatKey = 'MEDIUM_DATE';
    if (shouldShowFullYear || !isSameYear(start, end)) {
        startFormat = 'MEDIUM_DATE';
    } else if (shouldOmitCurrentYear && isThisYear(start) && isThisYear(end)) {
        endFormat = 'MONTH_DAY';
    }
    return joinRange(formatIntl(locale, startFormat, start), formatIntl(locale, endFormat, end), ' - ');
}

function getYearDateRange(year: number): {start: string; end: string} {
    return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
    };
}

function getQuarterDateBounds(year: number, quarter: number): {start: Date; end: Date} {
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    // Use set() to create dates in local timezone explicitly — `new Date(year, month, day)` already
    // builds local-time, but composing via set() keeps the intent obvious for the day=0 (last-of-prev-month) trick.
    return {
        start: set(new Date(), {year, month: startMonth - 1, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0}),
        end: set(new Date(), {year, month: endMonth, date: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0}),
    };
}

function getQuarterDateRange(year: number, quarter: number): {start: string; end: string} {
    const {start, end} = getQuarterDateBounds(year, quarter);
    return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd'),
    };
}

function getFormattedQuarterForSearch(year: number, quarter: number, locale: Locale): string {
    const {start, end} = getQuarterDateBounds(year, quarter);
    const formattedStart = formatIntl(locale, 'MONTH_DAY', start);
    const formattedEnd = formatIntl(locale, 'MONTH_DAY', end);
    if (!formattedStart || !formattedEnd) {
        return `Q${quarter} ${year}`;
    }
    return `Q${quarter} ${year} (${formattedStart} - ${formattedEnd})`;
}

function isDate(arg: unknown): arg is Date {
    return Object.prototype.toString.call(arg) === '[object Date]';
}

function getNextNthOfMonth(nth: number) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    // If today is before the nth day, return the nth of this month.
    if (day < nth) {
        return new Date(year, month, nth);
    }

    // Otherwise, return the nth of next month.
    return new Date(year, month + 1, nth);
}

// These hold values computed *through* Intl, so they go stale for the same reason the formatter caches do.
registerDerivedIntlCache(() => {
    getWeekStartsOn.cache.clear();
    getMonthNames.cache.clear();
    getLocalizedDatePlaceholder.cache.clear();
    isDayBeforeMonth.cache.clear();
});

const DateUtils = {
    formatToDayOfWeek,
    formatToLongDateWithWeekday,
    formatToLocalTime,
    formatToLongMonth,
    formatToReadableString,
    formatToLongMonthYear,
    formatToMediumDate,
    formatToShortMonthDayTime,
    formatToWeekdayLongDate,
    formatToLocalizedShortDate,
    formatInUTCToMedium,
    formatInUTCToLong,
    formatTransactionListDate,
    formatToShortMonthDay,
    formatInTimeZoneToLong,
    formatInTimeZoneToMediumDate,
    formatInTimeZoneToShortTime,
    formatInTimeZoneToWeekday,
    getZoneAbbreviation,
    datetimeToRelative,
    datetimeToCalendarTime,
    startCurrentDateUpdater,
    getLocalDateFromDatetime,
    getCurrentTimezone,
    canUpdateTimezone,
    setTimezoneUpdated,
    getMicroseconds,
    getDBTime,
    subtractMillisecondsFromDateTime,
    addMillisecondsFromDateTime,
    getRemainingSecondsInWindow,
    getEndOfToday,
    getStartOfToday,
    getDateFromStatusType,
    getOneHourFromNow,
    extractDate,
    getStatusUntilDate,
    extractTime12Hour,
    get12HourTimeObjectFromDate,
    getLocalizedTimePeriodDescription,
    combineDateAndTime,
    getDayValidationErrorKey,
    getTimeValidationErrorKey,
    isToday,
    isTomorrow,
    isYesterday,
    getMonthNames,
    getFilteredMonthItems,
    getDaysOfWeekNarrow,
    clearIntlFormatterCaches,
    refreshIntlFormatterCaches,
    toLocalDate,
    toUTCDate,
    getLocalizedDatePlaceholder,
    formatMachineDateWithUTCTimeZone,
    getWeekStartsOn,
    getWeekEndsOn,
    isTimeAtLeastOneMinuteInFuture,
    isValidStartEndTimeRange,
    formatToSupportedTimezone,
    getLastBusinessDayOfMonth,
    getFormattedDateRange,
    getFormattedReservationRangeDate,
    getFormattedTransportDate,
    getFormattedTransportDateAndHour,
    getFormattedCancellationDate,
    doesDateBelongToAPastYear,
    isCardExpired,
    getDifferenceInDaysFromNow,
    isValidDateString,
    getFormattedDurationBetweenDates,
    getFormattedDuration,
    formatCountdownTimer,
    isFutureDay,
    getStablePerDiemMerchantDateRange,
    isDate,
    getFormattedSplitDateRange,
    formatInTimeZoneWithFallback,
    formatUTCDateTimeToDateInTimezone,
    formatViolationSnapshotStartedAtDate,
    normalizeDateToStartOfDay,
    normalizeDateToEndOfDay,
    getMonthDateRange,
    getWeekDateRange,
    isDateStringInMonth,
    getFormattedDateRangeForSearch,
    getYearDateRange,
    getQuarterDateRange,
    getFormattedQuarterForSearch,
    getNextNthOfMonth,
};

export default DateUtils;

export {EMPTY_TWELVE_HOUR_TIME};
export type {MachineDateFormat};
