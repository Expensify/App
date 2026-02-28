import React from 'react';
import SearchFiltersCurrencyBase from '@components/Search/SearchFiltersCurrencyBase';
import CONST from '@src/CONST';

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
