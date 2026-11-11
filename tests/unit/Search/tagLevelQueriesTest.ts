import {buildChartDrillDownQuery} from '@components/Search/chartDrillDown';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {TransactionTagGroupListItemType} from '@components/Search/SearchList/ListItem/types';

import {buildFilterFormValuesFromQuery, buildQueryStringFromFilterFormValues, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import createMock from '../../utils/createMock';

describe('level-aware tag queries', () => {
    it.each(['', 'US:New\\: York', 'Path\\\\name', 'Team "A"'])('retains exact parent %j through URLs and advanced filters', (tagParent) => {
        // Given an exact selected-level filter, including the empty independent parent
        const query = buildSearchQueryJSON(buildQueryStringFromFilterFormValues({type: 'expense', tagLevel: '2', tagParent, tag: ['Marketing']}));

        // When Search serializes it or rebuilds it from the advanced-filter form
        const fromURL = buildSearchQueryJSON(buildSearchQueryString(query));
        const fromForm = query && buildSearchQueryJSON(buildQueryStringFromFilterFormValues(buildFilterFormValuesFromQuery(query, {}, {}, undefined, undefined, {}, {})));

        // Then neither path loses the level, parent, or query identity
        expect(query).toMatchObject({tagLevel: 2, tagParent});
        expect(fromURL).toMatchObject({tagLevel: 2, tagParent, hash: query?.hash});
        expect(fromForm).toMatchObject({tagLevel: 2, tagParent, hash: query?.hash});
    });

    it('keeps level and exact parent scopes in separate caches without changing legacy queries', () => {
        // Given the same tag text in legacy, independent, and dependent searches
        const scopes = ['tag:Marketing', 'tag:Marketing tagLevel:1', 'tag:Marketing tagLevel:2', 'tag:Marketing tagLevel:2 tagParent:""', 'tag:Marketing tagLevel:2 tagParent:US'];

        // When each scope is parsed
        const queries = scopes.map((query) => buildSearchQueryJSON(query));

        // Then all snapshot and recent-search identities differ
        expect(new Set(queries.map((query) => query?.hash)).size).toBe(scopes.length);
        expect(new Set(queries.map((query) => query?.recentSearchHash)).size).toBe(scopes.length);
        expect(queries[0]?.tagLevel).toBeUndefined();
        expect(queries[0]?.tagParent).toBeUndefined();
    });

    it.each(['0', '-1', '1.5', 'NaN'])('rejects invalid level %s and its parent', (level) => {
        // Given a manually edited query with an invalid level
        const input = `tag:Marketing tagLevel:${level} tagParent:US`;

        // When Search normalizes it
        const query = buildSearchQueryJSON(input);

        // Then it cannot apply a parent outside a valid level
        expect(query?.tagLevel).toBeUndefined();
        expect(query?.tagParent).toBeUndefined();
    });

    it.each(['', 'US:New\\: York'])('drills into only the clicked group under parent %j', (parentTagPath) => {
        // Given a leaf containing separators and quotes, with the chart narrowed by workspace
        const item = createMock<TransactionTagGroupListItemType>({groupedBy: CONST.SEARCH.GROUP_BY.TAG, tag: 'R&D: "West"\\Branch', tagLevel: 3, parentTagPath});
        const chart = buildSearchQueryJSON('groupBy:tag tagLevel:3 limit:5 policyID:A1 date:last-month');

        // When the user opens that bar on Spend
        const filter = CHART_GROUP_BY_CONFIG.tag.getFilterQuery(item);
        const query = chart && buildSearchQueryJSON(buildChartDrillDownQuery(chart, filter) ?? '');

        // Then the table preserves the raw leaf, exact parent, and workspace without retaining a chart limit
        expect(query).toMatchObject({view: CONST.SEARCH.VIEW.TABLE, tagLevel: 3, tagParent: parentTagPath});
        expect(query?.flatFilters).toContainEqual({key: 'tag', filters: [{operator: 'eq', value: item.tag}]});
        expect(query?.flatFilters).toContainEqual({key: 'policyID', filters: [{operator: 'eq', value: 'A1'}]});
        expect(query?.groupBy).toBeUndefined();
        expect(query?.limit).toBeUndefined();
    });
});
