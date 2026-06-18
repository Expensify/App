import SearchFiltersCurrencyBase from '@components/Search/SearchFiltersCurrencyBase';

import CONST from '@src/CONST';

import React from 'react';

function SearchFiltersPurchaseCurrencyPage() {
    return (
        <SearchFiltersCurrencyBase
            multiselect
            title="search.filters.purchaseCurrency"
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY}
        />
    );
}

export default SearchFiltersPurchaseCurrencyPage;
