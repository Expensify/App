import {getEmptyDateValues} from '@libs/SearchQueryUtils';

import {fromSearchDateValues, parseInsightsFilters, toSearchDateValues} from '@pages/Insights/insightsFilterParsing';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import DEFAULT_INSIGHTS_FILTERS, {INSIGHTS_RUNNING_TOTAL_GROUP_BY} from '@pages/Insights/insightsFilters';
import {buildInsightsQueryString} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';

const FILTERS: InsightsFilters = {
    date: {preset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE},
    policyIDs: [],
    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
    groupCurrency: 'USD',
};

const DATE_VARIANTS: Array<[string, InsightsFilters['date']]> = [
    ['a preset', {preset: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS}],
    ['a single day', {on: '2026-03-04'}],
    ['a range', {from: '2026-01-01', to: '2026-03-31'}],
];

describe('insightsFilterParsing', () => {
    describe('parseInsightsFilters', () => {
        it.each(DATE_VARIANTS)('reads back a dashboard reporting on %s', (_label, date) => {
            // Given a dashboard filtered to two workspaces, a currency, a time bucket and that date
            const filters: InsightsFilters = {...FILTERS, date, policyIDs: ['A1', 'B2'], groupBy: CONST.SEARCH.GROUP_BY.QUARTER, groupCurrency: 'PLN'};

            // When its stored query is read back
            const parsed = parseInsightsFilters(buildInsightsQueryString(filters));

            // Then every selection survives the round trip, so the page reopens where the user left it
            expect(parsed).toEqual(filters);
        });

        it.each(Object.values(CONST.SEARCH.COMPARE))('reads back a dashboard compared against %s', (compare) => {
            // Given a dashboard drawn against a comparison
            const filters: InsightsFilters = {...FILTERS, compare};

            // When its stored query is read back
            const parsed = parseInsightsFilters(buildInsightsQueryString(filters));

            // Then the comparison survives the round trip, so the page reopens with it still drawn
            expect(parsed.compare).toBe(compare);
        });

        it('tells a preset apart from a day that happens to be stored the same way', () => {
            // Given two dashboards, one on a preset and one on a literal day, which the query writes with the same `date:` operator
            const preset = parseInsightsFilters(buildInsightsQueryString({...FILTERS, date: {preset: CONST.SEARCH.DATE_PRESETS.THIS_MONTH}}));
            const day = parseInsightsFilters(buildInsightsQueryString({...FILTERS, date: {on: '2026-03-04'}}));

            // Then each is read back as what it is
            expect(preset.date).toEqual({preset: CONST.SEARCH.DATE_PRESETS.THIS_MONTH});
            expect(day.date).toEqual({on: '2026-03-04'});
        });

        it('reads the deprecated year-to-date preset as this year', () => {
            // Given a dashboard saved before Year to date was replaced by This year
            const query = 'groupBy:month groupCurrency:USD date:year-to-date';

            // When its stored query is read back
            const parsed = parseInsightsFilters(query);

            // Then it reads back as This year, so the date picker checks the row it lists
            expect(parsed.date).toEqual({preset: CONST.SEARCH.DATE_PRESETS.THIS_YEAR});
        });

        it('reads both ends of a range, which the query carries as two separate filters', () => {
            // Given a query bounded at both ends
            const query = 'groupBy:month groupCurrency:USD date>=2026-01-01 date<=2026-03-31';

            // When it is read back
            const parsed = parseInsightsFilters(query);

            // Then neither end is lost
            expect(parsed.date).toEqual({from: '2026-01-01', to: '2026-03-31'});
        });

        it.each(['date:unknown-preset', 'date:2026-02-30', 'date:2026-13-01', 'date>=invalid date<=2026-03-31', 'date>=2026-01-01 date<=2026-02-30'])(
            'leaves the default date in place for %s without dropping other selections',
            (dateFilter) => {
                // Given a stored query with an invalid date but valid currency and grouping selections
                const query = `groupBy:quarter groupCurrency:PLN ${dateFilter}`;

                // When the stored selections override the dashboard defaults
                const parsed = parseInsightsFilters(query);
                const filters = {...DEFAULT_INSIGHTS_FILTERS, ...parsed};

                // Then only the invalid date is ignored, so it cannot reach date formatting or the next query
                expect(parsed).not.toHaveProperty('date');
                expect(filters.date).toEqual(DEFAULT_INSIGHTS_FILTERS.date);
                expect(filters.groupBy).toBe(CONST.SEARCH.GROUP_BY.QUARTER);
                expect(filters.groupCurrency).toBe('PLN');
            },
        );

        it.each(Object.values(CONST.SEARCH.DATE_PRESETS))('preserves the recognized preset %s', (preset) => {
            // Given a known preset, including presets not offered by the Insights picker
            const query = `date:${preset}`;

            // When the query is restored
            const parsed = parseInsightsFilters(query);

            // Then known presets are not mistaken for invalid calendar dates
            const expected = preset === CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE ? CONST.SEARCH.DATE_PRESETS.THIS_YEAR : preset;
            expect(parsed.date).toEqual({preset: expected});
        });

        it('preserves a valid leap day', () => {
            // Given a literal date that is valid only in a leap year
            const query = 'date:2024-02-29';

            // When the query is restored
            const parsed = parseInsightsFilters(query);

            // Then calendar validation does not discard a valid custom day
            expect(parsed.date).toEqual({on: '2024-02-29'});
        });

        it('ignores a date the controls cannot show', () => {
            // Given a query left open at one end, which no Insights control can produce
            const parsed = parseInsightsFilters('groupBy:month groupCurrency:USD date>2026-01-01');

            // Then no date is read back, so the caller's default stays in place
            expect(parsed.date).toBeUndefined();
        });

        it('reads back a dashboard grouped by day', () => {
            // Given a dashboard grouped by day, the finest time bucket the headline chart offers
            const filters: InsightsFilters = {...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.DAY};

            // When its stored query is read back
            const parsed = parseInsightsFilters(buildInsightsQueryString(filters));

            // Then the daily grouping survives the round trip instead of falling back to the default
            expect(parsed.groupBy).toBe(CONST.SEARCH.GROUP_BY.DAY);
        });

        it('reads back a dashboard showing running total, which rides the saved query like any grouping', () => {
            // Given a dashboard whose grouping is running total, a value the shared Search parser does not know
            const filters: InsightsFilters = {...FILTERS, groupBy: INSIGHTS_RUNNING_TOTAL_GROUP_BY};

            // When its stored query is read back
            const parsed = parseInsightsFilters(buildInsightsQueryString(filters));

            // Then running total survives the round trip, so the dashboard reopens accumulating spend instead of falling back to the default
            expect(parsed.groupBy).toBe(INSIGHTS_RUNNING_TOTAL_GROUP_BY);
        });

        it('ignores a group-by no Insights chart offers', () => {
            // Given a query grouped by a dimension rather than a time bucket
            const parsed = parseInsightsFilters('groupBy:category groupCurrency:USD date:year-to-date');

            // Then no group-by is read back, so the caller's default stays in place
            expect(parsed.groupBy).toBeUndefined();
        });

        it('reads nothing out of a query it cannot parse', () => {
            // Given no stored query, and one that isn't a query at all
            // When each is read back
            // Then nothing is read, so the page falls back to its defaults
            expect(parseInsightsFilters(undefined)).toEqual({});
            expect(parseInsightsFilters('')).toEqual({});
        });
    });

    describe('toSearchDateValues / fromSearchDateValues', () => {
        it.each(['unknown-preset', '2026-02-30', '2026-11-08T00:00:00.000Z'])('rejects the invalid picker date %s', (on) => {
            // Given an unexpected value returned by the picker
            const values = {...getEmptyDateValues(), [CONST.SEARCH.DATE_MODIFIERS.ON]: on};

            // When Insights reads the selection
            const date = fromSearchDateValues(values);

            // Then the caller can retain the previous valid selection instead of accepting a broken date
            expect(date).toBeUndefined();
        });

        it.each(DATE_VARIANTS)('hands %s to the date picker and reads the same date back', (_label, date) => {
            // Given a date the dashboard reports on
            // When it is handed to the picker and read back unchanged
            const readBack = fromSearchDateValues(toSearchDateValues(date));

            // Then the dashboard is left reporting on the same date
            expect(readBack).toEqual(date);
        });

        it('reads no date out of an empty picker', () => {
            // Given a picker holding no date
            // When it is read back
            // Then nothing is returned, so the caller keeps the date it had
            expect(fromSearchDateValues(getEmptyDateValues())).toBeUndefined();
        });
    });
});
