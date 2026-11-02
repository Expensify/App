import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {TransactionMerchantGroupListItemType, TransactionTagGroupListItemType} from '@components/Search/SearchList/ListItem/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import createMock from '../../utils/createMock';

describe('chartGroupByConfig', () => {
    it.each([
        {tag: '', expectedTag: CONST.SEARCH.TAG_EMPTY_VALUE},
        {tag: '(untagged)', expectedTag: CONST.SEARCH.TAG_EMPTY_VALUE},
        {tag: 'Engineering:Backend', expectedTag: 'Engineering:Backend'},
        {tag: '12" Monitor', expectedTag: '12" Monitor'},
    ])('drills into tag "$tag" using "$expectedTag"', ({tag, expectedTag}) => {
        // Given a tag group returned by a chart snapshot
        const item = createMock<TransactionTagGroupListItemType>({tag});

        // When the group is opened on Spend
        const filterQuery = CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.TAG].getFilterQuery(item);

        // Then the full tag stays in one filter instead of becoming a partial tag and a keyword
        expect(buildSearchQueryJSON(filterQuery)?.flatFilters).toEqual([
            {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: expectedTag}]},
        ]);
    });

    it('uses the explicit exact operator for merchant drill-downs', () => {
        const item = createMock<TransactionMerchantGroupListItemType>({merchant: 'I'});

        expect(CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.MERCHANT].getFilterQuery(item)).toBe('merchant="I"');
    });
});
