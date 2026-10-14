import getInProgressBucketLabel from '@components/Search/getInProgressBucketLabel';
import type {GroupedItem} from '@components/Search/types';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import {translateLocal} from '../utils/TestHelper';

const TODAY = '2026-10-05';

const BASE = {keyForList: 'group', count: 1, total: 0, currency: CONST.CURRENCY.USD, transactions: []};

const monthGroup = (year: number, month: number): GroupedItem => ({
    ...BASE,
    groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
    year,
    month,
    formattedMonth: DateUtils.getFormattedMonthForSearch(year, month, undefined),
    shortFormattedMonth: DateUtils.getShortFormattedMonthForSearch(year, month, undefined),
    sortKey: year * 100 + month,
});
const weekGroup = (week: string): GroupedItem => {
    const {start, end} = DateUtils.getWeekDateRange(week);
    return {
        ...BASE,
        groupedBy: CONST.SEARCH.GROUP_BY.WEEK,
        week,
        formattedWeek: DateUtils.getFormattedDateRangeForSearch(start, end, undefined),
        shortFormattedWeek: DateUtils.getShortFormattedDateRangeForSearch(start, end, undefined),
    };
};
const quarterGroup = (year: number, quarter: number): GroupedItem => ({
    ...BASE,
    groupedBy: CONST.SEARCH.GROUP_BY.QUARTER,
    year,
    quarter,
    formattedQuarter: DateUtils.getFormattedQuarterForSearch(year, quarter, undefined),
    shortFormattedQuarter: DateUtils.getShortFormattedQuarterForSearch(year, quarter, undefined),
    sortKey: year * 10 + quarter,
});
const yearGroup = (year: number): GroupedItem => ({...BASE, groupedBy: CONST.SEARCH.GROUP_BY.YEAR, year, formattedYear: String(year), sortKey: year});
const dayGroup = (day: string): GroupedItem => ({
    ...BASE,
    groupedBy: CONST.SEARCH.GROUP_BY.DAY,
    day,
    formattedDay: DateUtils.formatToReadableString(day, undefined),
    shortFormattedDay: DateUtils.getShortFormattedDayForSearch(day, undefined),
});
const merchantGroup = (merchant: string): GroupedItem => ({...BASE, groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT, merchant, formattedMerchant: merchant});

function getLabel(item: GroupedItem, dateFilterRange: {start?: string; end?: string} = {}, today = TODAY) {
    return getInProgressBucketLabel({
        groupBy: item.groupedBy,
        item,
        today,
        dateFilterRange,
        dateFnsLocale: undefined,
        translate: translateLocal,
    });
}

describe('getInProgressBucketLabel', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
    });

    it('names the period that contains today', () => {
        // Given the day, week, month, quarter and year that contain today (Oct 5, 2026)
        // When labeling them
        const labels = [dayGroup(TODAY), weekGroup('2026-10-04'), monthGroup(2026, 10), quarterGroup(2026, 4), yearGroup(2026)].map((item) => getLabel(item));

        // Then each names its period and says it isn't over, so the partial total isn't read as a whole one
        expect(labels).toEqual(['Oct 5 so far', 'Week of Oct 4 so far', 'Oct so far', 'Q4 so far', '2026 so far']);
    });

    it('still labels a group on its last day', () => {
        // Given today being the last day of each period
        // When labeling the groups that end today
        const week = getLabel(weekGroup('2026-10-04'), {}, '2026-10-10');
        const month = getLabel(monthGroup(2026, 10), {}, '2026-10-31');
        const quarter = getLabel(quarterGroup(2026, 4), {}, '2026-12-31');
        const year = getLabel(yearGroup(2026), {}, '2026-12-31');

        // Then each is still in progress, because expenses dated today can still arrive
        expect(week).toBe('Week of Oct 4 so far');
        expect(month).toBe('Oct so far');
        expect(quarter).toBe('Q4 so far');
        expect(year).toBe('2026 so far');
    });

    it('stops labeling a group the day after it ends', () => {
        // Given today being the first day after each period
        // When labeling the groups that ended yesterday
        const week = getLabel(weekGroup('2026-10-04'), {}, '2026-10-11');
        const month = getLabel(monthGroup(2026, 10), {}, '2026-11-01');
        const quarter = getLabel(quarterGroup(2026, 4), {}, '2027-01-01');
        const year = getLabel(yearGroup(2026), {}, '2027-01-01');

        // Then none of them is labeled, since their totals are final
        expect([week, month, quarter, year]).toEqual([undefined, undefined, undefined, undefined]);
    });

    it('leaves a finished group unlabeled', () => {
        // Given September, which ended before today
        // When labeling it
        // Then there is no label, since its total won't grow
        expect(getLabel(monthGroup(2026, 9))).toBeUndefined();
    });

    it('leaves a group unlabeled when the query ends before today', () => {
        // Given October with a custom range that ends on Oct 3
        // When labeling it
        // Then there is no label, because the range is complete even though the month isn't
        expect(getLabel(monthGroup(2026, 10), {start: '2026-10-01', end: '2026-10-03'})).toBeUndefined();
    });

    it('names the whole month when the query starts inside it', () => {
        // Given October with a custom range from Oct 3 to today
        // When labeling it
        const label = getLabel(monthGroup(2026, 10), {start: '2026-10-03', end: TODAY});

        // Then it still names the month, since the label names the period rather than the days it covers
        expect(label).toBe('Oct so far');
    });

    it('leaves groups that are not time-based unlabeled', () => {
        // Given a merchant group, which has no dates
        // When labeling it
        // Then there is no label
        expect(getLabel(merchantGroup('some merchant'))).toBeUndefined();
    });
});
