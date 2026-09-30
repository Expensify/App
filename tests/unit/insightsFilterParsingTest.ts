import {getEmptyDateValues} from '@libs/SearchQueryUtils';

import {fromSearchDateValues, parseInsightsFilters, toSearchDateValues} from '@pages/Insights/insightsFilterParsing';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
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

        it('tells a preset apart from a day that happens to be stored the same way', () => {
            // Given two dashboards, one on a preset and one on a literal day, which the query writes with the same `date:` operator
            const preset = parseInsightsFilters(buildInsightsQueryString({...FILTERS, date: {preset: CONST.SEARCH.DATE_PRESETS.THIS_MONTH}}));
            const day = parseInsightsFilters(buildInsightsQueryString({...FILTERS, date: {on: '2026-03-04'}}));

            // Then each is read back as what it is
            expect(preset.date).toEqual({preset: CONST.SEARCH.DATE_PRESETS.THIS_MONTH});
            expect(day.date).toEqual({on: '2026-03-04'});
        });

        it('reads both ends of a range, which the query carries as two separate filters', () => {
            // Given a query bounded at both ends
            const query = 'groupBy:month groupCurrency:USD date>=2026-01-01 date<=2026-03-31';

            // When it is read back
            const parsed = parseInsightsFilters(query);

            // Then neither end is lost
            expect(parsed.date).toEqual({from: '2026-01-01', to: '2026-03-31'});
        });

        it('ignores a date the controls cannot show', () => {
            // Given a query left open at one end, which no Insights control can produce
            const parsed = parseInsightsFilters('groupBy:month groupCurrency:USD date>2026-01-01');

            // Then no date is read back, so the caller's default stays in place
            expect(parsed.date).toBeUndefined();
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
