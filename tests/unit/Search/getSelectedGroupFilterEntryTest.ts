import {getSelectedGroupFilterEntry} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

describe('getSelectedGroupFilterEntry', () => {
    it.each([
        [CONST.SEARCH.GROUP_BY.DAY, {day: '2026-09-11'}, {start: '2026-09-11', end: '2026-09-11'}],
        [CONST.SEARCH.GROUP_BY.WEEK, {week: '2026-09-07'}, {start: '2026-09-07', end: '2026-09-13'}],
        [CONST.SEARCH.GROUP_BY.MONTH, {year: 2026, month: 2}, {start: '2026-02-01', end: '2026-02-28'}],
        [CONST.SEARCH.GROUP_BY.QUARTER, {year: 2026, quarter: 3}, {start: '2026-07-01', end: '2026-09-30'}],
        [CONST.SEARCH.GROUP_BY.YEAR, {year: 2026}, {start: '2026-01-01', end: '2026-12-31'}],
    ])('scopes a %s group by the whole date range it covers', (groupBy, group, dateRange) => {
        // Given a time-based group as it arrives in the search snapshot

        // When the filter that scopes an export to that group is built
        const entry = getSelectedGroupFilterEntry(groupBy, group);

        // Then it is the group's inclusive date range, because the search syntax has no exact-match filter for a period
        expect(entry).toEqual({kind: 'dateRange', dateRange});
    });

    it('returns no filter for a time-based group that is missing its date fields', () => {
        // Given a month group without its month
        const group = {year: 2026};

        // When the filter that scopes an export to that group is built
        const entry = getSelectedGroupFilterEntry(CONST.SEARCH.GROUP_BY.MONTH, group);

        // Then there is none, so the export shows an error instead of scoping to a guessed range
        expect(entry).toBeUndefined();
    });
});
