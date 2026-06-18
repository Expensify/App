import SearchFiltersPurchaseAmountBase from '@components/Search/SearchFiltersAmountBase';

import CONST from '@src/CONST';

import React from 'react';

function SearchFiltersPurchaseAmountPage() {
    return (
        <SearchFiltersPurchaseAmountBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT}
            title="common.purchaseAmount"
            testID="SearchFiltersPurchaseAmountPage"
        />
    );
}

export default SearchFiltersPurchaseAmountPage;
