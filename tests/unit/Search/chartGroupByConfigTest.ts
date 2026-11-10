import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {TransactionMerchantGroupListItemType} from '@components/Search/SearchList/ListItem/types';

import CONST from '@src/CONST';

import createMock from '../../utils/createMock';

describe('chartGroupByConfig', () => {
    it('uses the explicit exact operator for merchant drill-downs', () => {
        const item = createMock<TransactionMerchantGroupListItemType>({merchant: 'I'});

        expect(CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.MERCHANT].getFilterQuery(item)).toBe('merchant="I"');
    });
});
