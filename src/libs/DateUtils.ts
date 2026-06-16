import {
    addDays,
    addHours,
    addMilliseconds,
    addMinutes,
    differenceInDays,
    eachDayOfInterval,
    eachMonthOfInterval,
    endOfDay,
    endOfMonth,
    endOfWeek,
    format,
    formatDistance,
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
import type {Day as WeekDay} from 'date-fns';
import {formatInTimeZone, fromZonedTime, toDate, toZonedTime, format as tzFormat} from 'date-fns-tz';
import {enUS} from 'date-fns/locale/en-US';
import {Str} from 'expensify-common';
import throttle from 'lodash/throttle';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import {timezoneBackwardToNewMap, timezoneNewToBackwardMap} from '@src/TIMEZONES';
import type Locale from '@src/types/onyx/Locale';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import {setCurrentDate} from './actions/CurrentDate';
import {translate as translateLocalize} from './Localize';
import Log from './Log';
import memoize from './memoize';

type CustomStatusTypes = ValueOf<typeof CONST.CUSTOM_STATUS_TYPES>;

const TIMEZONE_UPDATE_THROTTLE_MINUTES = 5;

type IntlFormatKey = keyof typeof CONST.DATE.INTL_FORMATS;

/** Narrows an arbitrary timezone string to one our backward-mapping table knows about. */
function isKnownTimezone(tz: string): tz is SelectedTimezone {
    return tz in timezoneNewToBackwardMap;
}

const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const satisfies readonly WeekDay[];
function isWeekDay(value: number): value is WeekDay {
    return (WEEK_DAYS as readonly number[]).includes(value);
}

/**
 * LRU-bounded (Intl.DateTimeFormat holds 10-50 KB ICU state per entry); retries with the backward-mapped IANA name on
 * older iOS/macOS (e.g. `Europe/Kyiv`); throws when no mapping exists — silent runtime-default fallback would produce wrong output.
 */
const getIntlDateTimeFormat = memoize(
    (locale: Locale, formatKey: IntlFormatKey, timeZone?: string): Intl.DateTimeFormat => {
        const preset = CONST.DATE.INTL_FORMATS[formatKey];
        const options = timeZone ? {...preset, timeZone} : preset;
        try {
            return new Intl.DateTimeFormat(locale, options);
        } catch (error) {
            const backwardTimeZone = timeZone && isKnownTimezone(timeZone) ? timezoneNewToBackwardMap[timeZone] : undefined;
            if (!backwardTimeZone || backwardTimeZone === timeZone) {
                Log.warn('[DateUtils] Intl.DateTimeFormat construction failed and no backward timezone mapping exists', {locale, formatKey, timeZone, error});
                throw error;
            }
            return new Intl.DateTimeFormat(locale, {...preset, timeZone: backwardTimeZone});
        }
    },
    {maxSize: 256},
);

/** Formats `date` via the cached Intl formatter and strips the narrow no-break space ICU 72+ inserts before AM/PM. */
function formatIntl(locale: Locale, formatKey: IntlFormatKey, date: Date, timeZone?: string): string {
    return getIntlDateTimeFormat(locale, formatKey, timeZone).format(date).replaceAll(CONST.DATE.INTL_NBSP_PATTERN, ' ');
}

/**
 * `'en'` pinned to Monday because Intl maps `'en'` → en-US (Sunday-start). Other locales via Intl
 * with dual access — Firefox exposes `weekInfo` as a property, Chromium/spec uses `getWeekInfo()`.
 * `try/catch` covers engines without `Intl.Locale`.
 */
function getWeekStartsOn(locale: Locale): WeekDay {
    if (locale === CONST.LOCALES.EN) {
        return 1;
    }
    try {
        const intlLocale = new Intl.Locale(locale);
        const weekInfo = typeof intlLocale.getWeekInfo === 'function' ? intlLocale.getWeekInfo() : intlLocale.weekInfo;
        if (!weekInfo) {
            return CONST.WEEK_STARTS_ON;
        }
        // Intl: Mon=1..Sun=7; date-fns: Sun=0..Sat=6
        const dateFnsDay = weekInfo.firstDay === 7 ? 0 : weekInfo.firstDay;
        return isWeekDay(dateFnsDay) ? dateFnsDay : CONST.WEEK_STARTS_ON;
    } catch {
        return CONST.WEEK_STARTS_ON;
    }
}

/**
 * Get the day of the week that the week ends on for the given locale (derived from `getWeekStartsOn` so they stay in lockstep).
 */
function getWeekEndsOn(locale: Locale): WeekDay {
    return WEEK_DAYS[(getWeekStartsOn(locale) + 6) % 7];
}

/**
 * Returns a zoned Date for the given datetime. `string` parses as ISO (with legacy `Z`-suffix fallback);
 * `Date`/`number` passes through; `undefined` reads `Date.now()` — only safe outside render.
 * `locale` is unused; kept on the signature for compat with LocaleContextProvider's wrapper.
 */
function getLocalDateFromDatetime(locale: Locale, currentSelectedTimezone: string, datetime?: string | Date | number): Date {
    if (datetime === undefined) {
        return toZonedSafe(new Date(), currentSelectedTimezone);
    }
    if (datetime instanceof Date || typeof datetime === 'number') {
        return toZonedSafe(datetime, currentSelectedTimezone);
    }
    let parsedDatetime: Date;
    try {
        // in some cases we cannot add 'Z' to the date string
        parsedDatetime = new Date(`${datetime}Z`);
        parsedDatetime.toISOString(); // we need to call toISOString because it throws RangeError in case of an invalid date
    } catch (e) {
        parsedDatetime = new Date(datetime);
    }
    return toZonedSafe(parsedDatetime, currentSelectedTimezone);
}

function toZonedSafe(date: Date | number, timeZone: string): Date {
    const res = toZonedTime(date, timeZone);
    if (Number.isNaN(res.getTime())) {
        Log.warn('DateUtils.toZonedSafe: toZonedTime returned an invalid date. Returning current date.', {date, timeZone});
        return new Date();
    }
    return res;
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
function datetimeToCalendarTime(locale: Locale, datetime: string, currentSelectedTimezone: SelectedTimezone, includeTimeZone = false, isLowercase = false): string {
    const date = getLocalDateFromDatetime(locale, fallbackToSupportedTimezone(currentSelectedTimezone), datetime);
    const tz = includeTimeZone ? ' [UTC]Z' : '';
    let todayAt = translateLocalize(locale, 'common.todayAt');
    let tomorrowAt = translateLocalize(locale, 'common.tomorrowAt');
    let yesterdayAt = translateLocalize(locale, 'common.yesterdayAt');
    const at = translateLocalize(locale, 'common.conjunctionAt');
    const weekStartsOn = getWeekStartsOn(locale);

    const nowInUserZone = toZonedTime(new Date(), currentSelectedTimezone);
    const startOfCurrentWeek = startOfWeek(nowInUserZone, {weekStartsOn});
    const endOfCurrentWeek = endOfWeek(nowInUserZone, {weekStartsOn});

    if (isLowercase) {
        todayAt = todayAt.toLowerCase();
        tomorrowAt = tomorrowAt.toLowerCase();
        yesterdayAt = yesterdayAt.toLowerCase();
    }

    const time = formatIntl(locale, 'SHORT_TIME', date);

    if (isToday(date, currentSelectedTimezone)) {
        return `${todayAt} ${time}${tz}`;
    }
    if (isTomorrow(date, currentSelectedTimezone)) {
        return `${tomorrowAt} ${time}${tz}`;
    }
    if (isYesterday(date, currentSelectedTimezone)) {
        return `${yesterdayAt} ${time}${tz}`;
    }
    if (date >= startOfCurrentWeek && date <= endOfCurrentWeek) {
        return `${formatIntl(locale, 'MONTH_DAY', date)} ${at} ${time}${tz}`;
    }
    return `${formatIntl(locale, 'MEDIUM_DATE', date)} ${at} ${time}${tz}`;
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
    return formatDistance(date, now, {addSuffix: true});
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
    return formatIntl(locale, 'FULL_DATE', new Date(datetime));
}

/** @returns Sunday (en) / domingo (es) */
function formatToDayOfWeek(datetime: Date, locale: Locale): string {
    return formatIntl(locale, 'LONG_WEEKDAY', datetime);
}

/** Locale-aware short time — 12h with AM/PM in en, 24h in es/de. @returns 2:30 PM (en) / 14:30 (es) */
function formatToLocalTime(datetime: string | Date, locale: Locale): string {
    return formatIntl(locale, 'SHORT_TIME', new Date(datetime));
}

/** @returns July 2025 (en) / julio de 2025 (es) */
function formatToLongMonthYear(datetime: Date | string, locale: Locale): string {
    return formatIntl(locale, 'LONG_MONTH_YEAR', new Date(datetime));
}

/** @returns Jul (en) / jul (es) */
function formatToShortMonth(datetime: Date | string, locale: Locale): string {
    return formatIntl(locale, 'SHORT_MONTH', new Date(datetime));
}

/** @returns July (en) / julio (es) */
function formatToLongMonth(datetime: Date | string, locale: Locale): string {
    return formatIntl(locale, 'LONG_MONTH', new Date(datetime));
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

/**
 * @returns [January, February, March, April, May, June, July, August, ...]
 */
function getMonthNames(locale: Locale): string[] {
    const fullYear = new Date().getFullYear();
    const monthsArray = eachMonthOfInterval({
        start: new Date(fullYear, 0, 1), // January 1st of the current year
        end: new Date(fullYear, 11, 31), // December 31st of the current year
    });
    return monthsArray.map((monthDate) => Str.UCFirst(formatIntl(locale, 'LONG_MONTH', monthDate)));
}

/**
 * Returns month list items for SelectionList.
 */
function getFilteredMonthItems(monthNames: string[], currentMonth: number) {
    return monthNames.map((month, index) => ({
        text: month,
        value: index,
        keyForList: index.toString(),
        isSelected: index === currentMonth,
    }));
}

/**
 * @returns [Monday, Tuesday, Wednesday, ...] in the order of the locale's first day of the week
 */
function getDaysOfWeek(locale: Locale): string[] {
    return weekdayNamesIn(locale, 'LONG_WEEKDAY');
}

/**
 * @returns Narrow weekday labels — en ["M","T","W","T","F","S","S"], zh-hans ["一","二","三","四","五","六","日"].
 * Slicing `getDaysOfWeek(…)[0]` collapses in CJK (Chinese long names all start with `星`).
 */
function getDaysOfWeekNarrow(locale: Locale): string[] {
    return weekdayNamesIn(locale, 'NARROW_WEEKDAY');
}

/** @returns Short weekday labels (en "Mon"/"Tue", fr "lun."/"mar.") — narrow labels collide in fr/it/pt-BR (duplicate first letters). */
function getDaysOfWeekShort(locale: Locale): string[] {
    return weekdayNamesIn(locale, 'SHORT_WEEKDAY');
}

/**
 * Year always shown as `YYYY` even when Intl renders 2-digit (en-US `dateStyle:'short'` → "12/31/24"
 * → placeholder "MM/DD/YYYY"). de → "DD.MM.YYYY"; ja → "YYYY/MM/DD".
 */
function getLocalizedDatePlaceholder(locale: Locale): string {
    const sample = new Date(2024, 11, 31);
    return getIntlDateTimeFormat(locale, 'SHORT_DATE')
        .formatToParts(sample)
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
}

function weekdayNamesIn(locale: Locale, formatKey: 'LONG_WEEKDAY' | 'SHORT_WEEKDAY' | 'NARROW_WEEKDAY'): string[] {
    const weekStartsOn = getWeekStartsOn(locale);
    const startOfCurrentWeek = startOfWeek(new Date(), {weekStartsOn});
    const endOfCurrentWeek = endOfWeek(new Date(), {weekStartsOn});
    return eachDayOfInterval({start: startOfCurrentWeek, end: endOfCurrentWeek}).map((date) => formatIntl(locale, formatKey, date));
}

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
    return format(new Date(dateTimeString), isFullFormat ? 'hh:mm:ss.SSS a' : 'hh:mm a', {locale: enUS});
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

    // If it's a time on the same date
    if (isSameDay(input, now)) {
        return translate('statusPage.untilTime', time);
    }

    // If it's further in the future than tomorrow but within the same year
    if (isAfter(input, now) && isSameYear(input, now)) {
        return translate('statusPage.untilTime', `${formatIntl(locale, 'MONTH_DAY', date, currentSelectedTimezone)} ${time}`);
    }

    // If it's in another year
    return translate('statusPage.untilTime', `${formatIntl(locale, 'MEDIUM_DATE', date, currentSelectedTimezone)} ${time}`);
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

/**
 * param {String} dateTime in 'HH:mm:ss.SSS a' format
 * returns {Object}
 * example {hour: '11', minute: '10', seconds: '10', milliseconds: '123', period: 'AM'}
 */
function get12HourTimeObjectFromDate(dateTime: string, isFullFormat = false): {hour: string; minute: string; seconds: string; milliseconds: string; period: string} {
    if (!dateTime) {
        return {
            hour: '12',
            minute: '00',
            seconds: '00',
            milliseconds: '000',
            period: 'PM',
        };
    }
    const parsedTime = parse(dateTime, isFullFormat ? 'hh:mm:ss.SSS a' : 'hh:mm a', new Date(), {locale: enUS});
    // Without this guard the AM/PM branch silently returns 'AM' for Invalid Date (`NaN >= 12` is false).
    if (!isValid(parsedTime)) {
        throw new RangeError(`Invalid time value: ${dateTime}`);
    }
    return {
        hour: format(parsedTime, 'hh'),
        minute: format(parsedTime, 'mm'),
        seconds: isFullFormat ? format(parsedTime, 'ss') : '00',
        milliseconds: isFullFormat ? format(parsedTime, 'SSS') : '000',
        period: parsedTime.getHours() >= 12 ? 'PM' : 'AM',
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
 *
 * Get a date and format this date using the UTC timezone.
 * param datetime
 * param dateFormat
 * returns If the date is valid, returns the formatted date with the UTC timezone, otherwise returns an empty string.
 */
function formatWithUTCTimeZone(datetime: string, dateFormat: string = CONST.DATE.FNS_FORMAT_STRING) {
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
 * Returns a formatted date range from date 1 to date 2.
 * Dates are formatted as follows:
 * 1. When both dates refer to the same day: Mar 17
 * 2. When both dates refer to the same month: Mar 17-20
 * 3. When both dates refer to the same year: Feb 28 to Mar 1
 * 4. When the dates are from different years: Dec 28, 2023 to Jan 5, 2024
 */
function getFormattedDateRange(translate: LocalizedTranslate, date1: Date, date2: Date, locale: Locale): string {
    if (isSameDay(date1, date2)) {
        // Dates are from the same day
        return formatIntl(locale, 'MONTH_DAY', date1);
    }
    if (isSameMonth(date1, date2)) {
        // Dates in the same month and year, differ by days
        return `${formatIntl(locale, 'MONTH_DAY', date1)}-${formatIntl(locale, 'DAY_ONLY', date2)}`;
    }
    if (isSameYear(date1, date2)) {
        // Dates are in the same year, differ by months
        return `${formatIntl(locale, 'MONTH_DAY', date1)} ${translate('common.to').toLowerCase()} ${formatIntl(locale, 'MONTH_DAY', date2)}`;
    }
    // Dates differ by years, months, days
    return `${formatIntl(locale, 'MEDIUM_DATE', date1)} ${translate('common.to').toLowerCase()} ${formatIntl(locale, 'MEDIUM_DATE', date2)}`;
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
    if (isSameYear(date1, date2) && isThisYear(date1)) {
        // Dates are in the current year, differ by months
        return `${formatIntl(locale, 'WEEKDAY_MONTH_DAY', date1)} ${translate('common.conjunctionTo')} ${formatIntl(locale, 'WEEKDAY_MONTH_DAY', date2)}`;
    }
    // Dates differ by years, months, days or only by months but the year is not current
    return `${formatIntl(locale, 'WEEKDAY_MONTH_DAY_YEAR', date1)} ${translate('common.conjunctionTo')} ${formatIntl(locale, 'WEEKDAY_MONTH_DAY_YEAR', date2)}`;
}

/**
 * Returns a formatted date of departure.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Departs on Sunday, Mar 17 at 8:00.
 * 2. When the date refers not to the current year: Departs on Wednesday, Mar 17, 2023 at 8:00.
 */
function getFormattedTransportDate(translate: LocalizedTranslate, date: Date, locale: Locale): string {
    const time = formatIntl(locale, 'SHORT_TIME', date);
    const dateOptions: IntlFormatKey = isThisYear(date) ? 'WEEKDAY_MONTH_DAY' : 'WEEKDAY_MONTH_DAY_YEAR';
    const datePart = formatIntl(locale, dateOptions, date);
    return `${translate('travel.departs')} ${datePart} ${translate('common.conjunctionAt')} ${time}`;
}

/**
 * Returns a formatted flight date and hour.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Wednesday, Mar 17 8:00 AM
 * 2. When the date refers not to the current year: Wednesday, Mar 17, 2023 8:00 AM
 */
function getFormattedTransportDateAndHour(date: Date, locale: Locale): {date: string; hour: string} {
    const dateOptions: IntlFormatKey = isThisYear(date) ? 'WEEKDAY_MONTH_DAY' : 'WEEKDAY_MONTH_DAY_YEAR';
    return {
        date: formatIntl(locale, dateOptions, date),
        hour: formatIntl(locale, 'SHORT_TIME', date),
    };
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

function doesDateBelongToAPastYear(date: string): boolean {
    const transactionYear = new Date(date).getFullYear();
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

/** Persists as the backend merchant string — uses date-fns over Intl because `dateStyle:'medium'` drifts across ICU versions (`"Jun"` vs `"Jun."`). */
function getStablePerDiemMerchantDateRange(date1: Date, date2: Date): string {
    return `${format(date1, 'MMM d, yyyy')} - ${format(date2, 'MMM d, yyyy')}`;
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

/**
 * Parses `'yyyy-MM-dd'` as local midnight; passes `Date` and non-ISO-date strings through. Use
 * `toUTCDate` instead when the result feeds a UTC-zone formatter (otherwise calendar day shifts
 * for viewers east of UTC).
 */
function toLocalDate(date: Date | string): Date {
    if (typeof date !== 'string') {
        return date;
    }
    return ISO_DATE_PATTERN.test(date) ? parse(date, 'yyyy-MM-dd', new Date()) : new Date(date);
}

/**
 * Like `toLocalDate` but anchors `'yyyy-MM-dd'` strings to UTC midnight, so downstream UTC-zone
 * formatters render the intended calendar day for viewers east of UTC.
 */
function toUTCDate(date: Date | string): Date {
    if (typeof date !== 'string') {
        return date;
    }
    if (ISO_DATE_PATTERN.test(date)) {
        return new Date(`${date}T00:00:00Z`);
    }
    // DB timestamps (`yyyy-MM-dd HH:mm:ss[.SSS]`) must parse as UTC; local parsing shifts the calendar day backward for UTC+ viewers.
    return toDate(date, {timeZone: 'UTC'});
}

/**
 * Converts a date to a locale-aware long date string (e.g. "March 1, 2025" in English).
 */
function formatToReadableString(date: Date | string, locale: Locale): string {
    return formatIntl(locale, 'LONG_DATE', toLocalDate(date));
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

/** UTC-anchored Jul 9 / 9 jul (no year). See `formatInUTCToMedium` for the UTC-anchoring rationale. */
function formatInUTCToShort(date: Date | string, locale: Locale): string {
    if (!date) {
        return '';
    }
    return formatIntl(locale, 'MONTH_DAY', toUTCDate(date), 'UTC');
}

/** UTC-anchored July 9, 2023 / 9 de julio de 2023. See `formatInUTCToMedium`. */
function formatInUTCToLong(date: Date | string, locale: Locale): string {
    if (!date) {
        return '';
    }
    return formatIntl(locale, 'LONG_DATE', toUTCDate(date), 'UTC');
}

/** Transaction-list convention: MEDIUM ("Jul 9, 2023") for past years, SHORT ("Jul 9") for current. */
function formatTransactionListDate(date: string, locale: Locale): string {
    if (!date) {
        return '';
    }
    return doesDateBelongToAPastYear(date) ? formatInUTCToMedium(date, locale) : formatInUTCToShort(date, locale);
}

/**
 * Input must be a full ISO timestamp. For `'yyyy-MM-dd'` use `formatToReadableString` or `formatInUTCToLong` —
 * applying a timeZone shift on top of local-midnight parse silently shifts the calendar day. Throws on date-only
 * input to fail fast.
 */
function formatInTimeZoneToLong(date: Date | string, timeZone: SelectedTimezone, locale: Locale): string {
    if (!date) {
        return '';
    }
    if (typeof date === 'string' && ISO_DATE_PATTERN.test(date)) {
        throw new RangeError(`formatInTimeZoneToLong: date-only string '${date}' produces day-shift. Use formatToReadableString or formatInUTCToLong.`);
    }
    return formatIntl(locale, 'LONG_DATE', toLocalDate(date), timeZone);
}

/** Full ISO timestamp only. See `formatInTimeZoneToLong` for the date-only caveat. */
function formatInTimeZoneToShortTime(date: Date | string, timeZone: SelectedTimezone, locale: Locale): string {
    if (!date) {
        return '';
    }
    if (typeof date === 'string' && ISO_DATE_PATTERN.test(date)) {
        throw new RangeError(`formatInTimeZoneToShortTime: date-only string '${date}' has no time component.`);
    }
    return formatIntl(locale, 'SHORT_TIME', toLocalDate(date), timeZone);
}

/** Full ISO timestamp only. See `formatInTimeZoneToLong` for the date-only caveat. */
function formatInTimeZoneToWeekday(date: Date | string, timeZone: SelectedTimezone, locale: Locale): string {
    if (!date) {
        return '';
    }
    if (typeof date === 'string' && ISO_DATE_PATTERN.test(date)) {
        throw new RangeError(`formatInTimeZoneToWeekday: date-only string '${date}' produces day-shift. Use formatToReadableString.`);
    }
    return formatIntl(locale, 'LONG_WEEKDAY', toLocalDate(date), timeZone);
}

/**
 * Retries with the backward-mapped IANA on platforms rejecting newer zone IDs (older iOS/macOS);
 * falls back to UTC + warn rather than throwing — render-path callers have no error boundaries.
 */
function formatInTimeZoneWithFallback(date: Date | string | number, timeZone: string, formatStr: string, options?: Parameters<typeof formatInTimeZone>[3]): string {
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
        return formatInTimeZone(date, 'UTC', formatStr, options);
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
    if (shouldShowFullYear || !isSameYear(start, end)) {
        return `${formatIntl(locale, 'MEDIUM_DATE', start)} - ${formatIntl(locale, 'MEDIUM_DATE', end)}`;
    }
    if (shouldOmitCurrentYear && isThisYear(start) && isThisYear(end)) {
        return `${formatIntl(locale, 'MONTH_DAY', start)} - ${formatIntl(locale, 'MONTH_DAY', end)}`;
    }
    return `${formatIntl(locale, 'MONTH_DAY', start)} - ${formatIntl(locale, 'MEDIUM_DATE', end)}`;
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
    return `Q${quarter} ${year} (${formatIntl(locale, 'MONTH_DAY', start)} - ${formatIntl(locale, 'MONTH_DAY', end)})`;
}

function isDate(arg: unknown): arg is Date {
    return Object.prototype.toString.call(arg) === '[object Date]';
}

const DateUtils = {
    formatToDayOfWeek,
    formatToLongDateWithWeekday,
    formatToLocalTime,
    formatToLongMonthYear,
    formatToShortMonth,
    formatToLongMonth,
    formatToReadableString,
    formatToMediumDate,
    formatToLocalizedShortDate,
    formatToLocalDateTime,
    formatInUTCToMedium,
    formatInUTCToShort,
    formatInUTCToLong,
    formatTransactionListDate,
    formatInTimeZoneToLong,
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
    getDaysOfWeek,
    getDaysOfWeekShort,
    getDaysOfWeekNarrow,
    toUTCDate,
    getLocalizedDatePlaceholder,
    formatWithUTCTimeZone,
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
    normalizeDateToStartOfDay,
    normalizeDateToEndOfDay,
    getMonthDateRange,
    getWeekDateRange,
    isDateStringInMonth,
    getFormattedDateRangeForSearch,
    getYearDateRange,
    getQuarterDateRange,
    getFormattedQuarterForSearch,
};

export default DateUtils;
