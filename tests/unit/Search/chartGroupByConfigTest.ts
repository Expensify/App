import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {TransactionMerchantGroupListItemType, TransactionTagGroupListItemType} from '@components/Search/SearchList/ListItem/types';

import CONST from '@src/CONST';

import createMock from '../../utils/createMock';

describe('chartGroupByConfig', () => {
    it.each([
        {tag: '', expectedTag: CONST.SEARCH.TAG_EMPTY_VALUE},
        {tag: '(untagged)', expectedTag: CONST.SEARCH.TAG_EMPTY_VALUE},
        {tag: 'Engineering:Backend', expectedTag: 'Engineering:Backend'},
    ])('drills into tag "$tag" using "$expectedTag"', ({tag, expectedTag}) => {
        // Given a tag group returned by a chart snapshot
        const item = createMock<TransactionTagGroupListItemType>({tag});

        // When the group is opened on Spend
        const filterQuery = CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.TAG].getFilterQuery(item);

        // Then missing tags use the empty-tag filter while full tag combinations stay intact
        expect(filterQuery).toBe(`tag:"${expectedTag}"`);
    });

    it('uses the explicit exact operator for merchant drill-downs', () => {
        const item = createMock<TransactionMerchantGroupListItemType>({merchant: 'I'});

        expect(CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.MERCHANT].getFilterQuery(item)).toBe('merchant="I"');
    });
});
