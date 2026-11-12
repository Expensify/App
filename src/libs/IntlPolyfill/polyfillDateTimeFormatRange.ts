/**
 * Adds `Intl.DateTimeFormat.prototype.formatRange` to engines that lack it, such as Hermes on iOS.
 *
 * Only this one method is polyfilled. The engine's own `DateTimeFormat` keeps formatting single dates, and formatjs
 * formats the range from the same resolved options. Replacing the whole constructor would also mean shipping time
 * zone data, which formatjs needs for every zone except UTC.
 */
import {DateTimeFormat as FormatjsDateTimeFormat} from '@formatjs/intl-datetimeformat';

type FormatjsFormatter = InstanceType<typeof FormatjsDateTimeFormat>;

/** Joins the two dates when formatjs can't format the range, the way `formatRange` separates them in English. */
const RANGE_SEPARATOR = ' – ';

/**
 * formatjs ships no time zone data here, and it reads any zone it has no data for as UTC instead of throwing, so a
 * range in any other zone would show the wrong days.
 */
const UTC_TIME_ZONES = new Set(['UTC', 'Etc/UTC', 'GMT', 'Etc/GMT']);

/** One formatjs formatter per engine formatter, since building one costs far more than formatting with it. */
const formatjsFormatters = new WeakMap<Intl.DateTimeFormat, FormatjsFormatter | null>();

/** Returns the formatjs formatter for `dateTimeFormat`, or null when formatjs can't format its ranges correctly. */
function getFormatjsFormatter(dateTimeFormat: Intl.DateTimeFormat): FormatjsFormatter | null {
    const cachedFormatter = formatjsFormatters.get(dateTimeFormat);
    if (cachedFormatter !== undefined) {
        return cachedFormatter;
    }

    // The locale is passed on its own, and formatjs only has data for the Gregorian calendar and Latin digits, so the
    // calendar and numbering system are left to the locale's defaults.
    const {locale, calendar, numberingSystem, ...options} = dateTimeFormat.resolvedOptions();

    // Until the language's data loads (see IntlStore), formatjs would fall back to English, so the range is joined
    // from the engine's own dates instead. The formatter isn't cached then, so it picks formatjs up once the data loads.
    if (FormatjsDateTimeFormat.supportedLocalesOf([locale]).length === 0) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- resolvedOptions() types each field as a plain string, but its values are the ones the engine accepted as these options
    const formatter = UTC_TIME_ZONES.has(options.timeZone) ? new FormatjsDateTimeFormat(locale, options as Intl.DateTimeFormatOptions) : null;
    formatjsFormatters.set(dateTimeFormat, formatter);
    return formatter;
}

export default function polyfillDateTimeFormatRange() {
    if (typeof Intl.DateTimeFormat.prototype.formatRange === 'function') {
        return;
    }

    // formatjs locale data registers itself on the global `Intl.DateTimeFormat`, which stays the engine's own here, so
    // the data is forwarded to the formatjs class. Its presence also tells shouldPolyfill that this polyfill is installed.
    Object.defineProperty(Intl.DateTimeFormat, '__addLocaleData', {
        // eslint-disable-next-line no-underscore-dangle -- `__addLocaleData` is the name formatjs's locale data files call
        value: (...data: Parameters<typeof FormatjsDateTimeFormat.__addLocaleData>) => FormatjsDateTimeFormat.__addLocaleData(...data),
        configurable: true,
    });

    Object.defineProperty(Intl.DateTimeFormat.prototype, 'formatRange', {
        value: function formatRange(this: Intl.DateTimeFormat, startDate: Date | number, endDate: Date | number): string {
            const formatjsFormatter = getFormatjsFormatter(this);
            if (!formatjsFormatter) {
                return `${this.format(startDate)}${RANGE_SEPARATOR}${this.format(endDate)}`;
            }
            return formatjsFormatter.formatRange(startDate, endDate);
        },
        writable: true,
        configurable: true,
    });
}
