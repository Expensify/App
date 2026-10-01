import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ChartBucketRange} from '@components/Search/chartGroupByConfig';

import {getDateRangeForPreset} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import {
    differenceInCalendarDays,
    differenceInCalendarMonths,
    endOfMonth,
    format,
    getYear,
    isSameDay,
    isSameYear,
    parseISO,
    startOfMonth,
    startOfYear,
    subDays,
    subMonths,
    subYears,
} from 'date-fns';

import type {InsightsFilters} from './insightsFilters';

/** One of the two periods a chart plots: how the legend names it and the dates it covers. */
type ComparisonWindow = {
    label: string;

    range: ChartBucketRange;
};

type ComparisonWindows = {
    /** The period on screen */
    current: ComparisonWindow;

    /** The period before it, drawn as the charts' second series */
    previous: ComparisonWindow;
};

/** A month names itself, so it takes the standalone form the locale spells it with */
const MONTH_LABEL_FORMAT = 'LLL yyyy';

const DAY_LABEL_FORMAT = 'MMM d';
const DAY_WITH_YEAR_LABEL_FORMAT = 'MMM d, yyyy';

function toRange(start: Date, end: Date): ChartBucketRange {
    return {
        start: format(start, CONST.DATE.FNS_FORMAT_STRING),
        end: format(end, CONST.DATE.FNS_FORMAT_STRING),
    };
}

/** A whole month and the month before it. */
function resolveMonthWindows(currentRange: ChartBucketRange): ComparisonWindows {
    const month = parseISO(currentRange.start);
    const previousMonth = subMonths(month, 1);

    return {
        current: {label: format(month, MONTH_LABEL_FORMAT), range: currentRange},
        previous: {
            label: format(previousMonth, MONTH_LABEL_FORMAT),
            range: toRange(startOfMonth(previousMonth), endOfMonth(previousMonth)),
        },
    };
}

/**
 * The two periods the charts compare, resolved from the page's Date selection.
 *
 * Nothing is compared against a selection with no period before it to compare against, which the caller reads as
 * comparison being unavailable.
 */
function resolveComparisonWindows(date: InsightsFilters['date'], translate: LocaleContextProps['translate']): ComparisonWindows | undefined {
    if ('preset' in date) {
        // The period on screen comes from the same resolver the search query is built with, so only the one before it is worked out here.
        const currentRange = getDateRangeForPreset(date.preset);
        if (!currentRange.start || !currentRange.end) {
            return undefined;
        }
        const currentStart = parseISO(currentRange.start);
        const currentEnd = parseISO(currentRange.end);

        switch (date.preset) {
            case CONST.SEARCH.DATE_PRESETS.THIS_MONTH:
            case CONST.SEARCH.DATE_PRESETS.LAST_MONTH:
                return resolveMonthWindows(currentRange);
            case CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE: {
                const sameDayLastYear = subYears(currentEnd, 1);

                return {
                    current: {label: translate('insightsPage.compare.yearToDate', getYear(currentEnd)), range: currentRange},
                    previous: {
                        label: translate('insightsPage.compare.yearToDate', getYear(sameDayLastYear)),
                        range: toRange(startOfYear(sameDayLastYear), sameDayLastYear),
                    },
                };
            }
            case CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS:
                return {
                    current: {label: translate('insightsPage.compare.lastTwelveMonths'), range: currentRange},
                    previous: {
                        label: translate('insightsPage.compare.priorMonths', 12),
                        range: toRange(subMonths(currentStart, 12), endOfMonth(subMonths(currentEnd, 12))),
                    },
                };
            default:
                return undefined;
        }
    }

    const start = parseISO('on' in date ? date.on : date.from);
    const end = parseISO('on' in date ? date.on : date.to);
    // A range covering whole months is compared month for month, so its length and the period it opens agree.
    const coversWholeMonths = isSameDay(start, startOfMonth(start)) && isSameDay(end, endOfMonth(end));
    const monthCount = differenceInCalendarMonths(end, start) + 1;
    const dayCount = differenceInCalendarDays(end, start) + 1;

    // Whatever its length, a custom range is compared against the range of the same length ending the day before it starts.
    const previousEnd = subDays(start, 1);
    const previousStart = coversWholeMonths ? subMonths(start, monthCount) : subDays(start, dayCount);

    // A single day is named by its date; any longer range is named by its length, in whole months when it covers them.
    const previousLabel = (() => {
        if (isSameDay(start, end)) {
            return format(previousEnd, DAY_LABEL_FORMAT);
        }
        return coversWholeMonths ? translate('insightsPage.compare.priorMonths', monthCount) : translate('insightsPage.compare.priorDays', dayCount);
    })();

    // A range within one year needs no year on either end; one that crosses years is ambiguous without them.
    const dayFormat = isSameYear(start, end) ? DAY_LABEL_FORMAT : DAY_WITH_YEAR_LABEL_FORMAT;

    return {
        current: {
            label: isSameDay(start, end) ? format(start, DAY_LABEL_FORMAT) : `${format(start, dayFormat)} - ${format(end, dayFormat)}`,
            range: toRange(start, end),
        },
        previous: {label: previousLabel, range: toRange(previousStart, previousEnd)},
    };
}

export default resolveComparisonWindows;
