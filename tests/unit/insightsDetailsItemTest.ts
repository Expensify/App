import type {GroupedItem} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import {getInsightsDetailsItemParams, resolveInsightsDetailsItem} from '@pages/Insights/details/insightsDetailsItem';

import CONST from '@src/CONST';

const translate = jest.fn((key: string) => key);

function resolve(groupBy: Parameters<typeof resolveInsightsDetailsItem>[0]['groupBy'], itemKey: string, periodEnd?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the resolver only reads the translation keys it passes
    return resolveInsightsDetailsItem({groupBy, itemKey, periodEnd, member: {accountID: 1, displayName: 'Jane Doe'}, dateFnsLocale: undefined, translate: translate as never});
}

describe('insightsDetailsItem', () => {
    it('names a time group by its first and last day', () => {
        // Given a February group on a chart grouped by month over the whole year
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the fields the key reads are needed
        const item = {groupedBy: CONST.SEARCH.GROUP_BY.MONTH, year: 2026, month: 2} as GroupedItem;
        const queryJSON = buildSearchQueryJSON('type:expense date>=2026-01-01 date<=2026-12-31');

        // When the Details panel's URL params are built for it
        const itemParams = queryJSON && getInsightsDetailsItemParams(item, queryJSON);

        // Then the keys span all of February
        expect(itemParams).toEqual({itemKey: '2026-02-01', periodEnd: '2026-02-28'});
    });

    it('trims a week cut off by the date range, like the chart labels it', () => {
        // Given a week starting Sunday, March 1, on a chart whose date range starts Wednesday, March 4
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the fields the key reads are needed
        const item = {groupedBy: CONST.SEARCH.GROUP_BY.WEEK, week: '2026-03-01'} as GroupedItem;
        const queryJSON = buildSearchQueryJSON('type:expense date>=2026-03-04 date<=2026-03-31');

        // When the Details panel's URL params are built for it
        const itemParams = queryJSON && getInsightsDetailsItemParams(item, queryJSON);

        // Then the keys start on the range's first day, so the panel's title matches the chart's label
        expect(itemParams).toEqual({itemKey: '2026-03-04', periodEnd: '2026-03-07'});
    });

    it('names a member group by their account ID', () => {
        // Given a Top spenders group
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the fields the key reads are needed
        const item = {groupedBy: CONST.SEARCH.GROUP_BY.FROM, accountID: 42} as GroupedItem;
        const queryJSON = buildSearchQueryJSON('type:expense');

        // When the Details panel's URL params are built for it
        const itemParams = queryJSON && getInsightsDetailsItemParams(item, queryJSON);

        // Then the key is the account ID, so the URL carries no name that can change
        expect(itemParams).toEqual({itemKey: '42'});
    });

    it('resolves a month to its label and a filter on its dates', () => {
        // Given the keys of February on a chart grouped by month
        // When the panel resolves them
        const item = resolve(CONST.SEARCH.GROUP_BY.MONTH, '2026-02-01', '2026-02-28');

        // Then the title is the month and the filter spans all of February
        expect(item).toEqual({title: 'February 2026', filterQuery: 'date>=2026-02-01 date<=2026-02-28'});
    });

    it('resolves a member key to their name and a filter on their account', () => {
        // Given the key of a member on Top spenders
        // When the panel resolves it
        const item = resolve(CONST.SEARCH.GROUP_BY.FROM, '1');

        // Then the title is the member's display name and the filter narrows to their expenses
        expect(item).toEqual({title: 'Jane Doe', filterQuery: 'from:1'});
    });

    it.each([
        ['foo', '2026-03-31'],
        ['2026-03-01', 'foo'],
        ['2026-03-01', undefined],
    ])('resolves no period for the keys "%s" and "%s"', (itemKey, periodEnd) => {
        // Given period keys that are not dates, as in a hand-edited URL
        // When the panel resolves them
        const item = resolve(CONST.SEARCH.GROUP_BY.MONTH, itemKey, periodEnd);

        // Then nothing resolves, so the panel shows the not found page instead of failing to format the title
        expect(item).toBeUndefined();
    });

    it('resolves no member whose name is unknown', () => {
        // Given the key of an account with no stored details, so the panel has no name to title it with
        // When the panel resolves it
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the resolver only reads the translation keys it passes
        const item = resolveInsightsDetailsItem({groupBy: CONST.SEARCH.GROUP_BY.FROM, itemKey: '999999', member: undefined, dateFnsLocale: undefined, translate: translate as never});

        // Then nothing resolves, so the panel shows the not found page instead of an untitled panel
        expect(item).toBeUndefined();
    });

    it('titles an empty merchant like the chart does', () => {
        // Given the key of expenses with no merchant
        // When the panel resolves it
        const item = resolve(CONST.SEARCH.GROUP_BY.MERCHANT, '');

        // Then the title reads No merchant, matching the chart's label for that group
        expect(item?.title).toBe('search.noMerchant');
    });
});
