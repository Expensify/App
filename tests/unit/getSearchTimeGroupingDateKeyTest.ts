import getSearchTimeGroupingDateKey from '@libs/getSearchTimeGroupingDateKey';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

describe('getSearchTimeGroupingDateKey', () => {
    it('leaves non-expense query grouping unchanged', () => {
        // Given an invoice query outside the expense grouping change
        const query = buildSearchQueryJSON('type:invoice groupBy:month submitted:this-year');

        // When the shared chart resolves its date field
        const dateKey = getSearchTimeGroupingDateKey(query);

        // Then it retains the existing expense-date behavior, matching Auth's scope
        expect(dateKey).toBe('date');
    });

    it.each([
        ['submitted:this-year', 'submitted'],
        ['date:this-year', 'date'],
        ['submitted>=2026-01-01 submitted<=2026-03-31', 'submitted'],
        ['anySubmission:this-year has:submitted-violation', 'anySubmission'],
        ['anyApproval:this-year has:approved-violation', 'anyApproval'],
        ['approved:this-year', 'approved'],
        ['submitted:this-year date:this-year', 'date'],
        ['date:this-year submitted:this-year', 'date'],
        ['submitted:this-year anyApproval:this-year', 'date'],
        ['submitted:this-year -approved:this-year', 'submitted'],
        ['-submitted:this-year', 'date'],
        ['submitted:never', 'date'],
        ['has:submitted-violation', 'date'],
    ])('groups %s by %s', (filters, expected) => {
        // Given a time-grouped Search query, also used to identify an Insights chart snapshot
        const query = buildSearchQueryJSON(`type:expense groupBy:week ${filters}`);

        // When the chart resolves which dates its buckets represent
        const dateKey = getSearchTimeGroupingDateKey(query);

        // Then the positive date field wins unless expense dates are explicit or the choice is ambiguous
        expect(dateKey).toBe(expected);
    });
});
