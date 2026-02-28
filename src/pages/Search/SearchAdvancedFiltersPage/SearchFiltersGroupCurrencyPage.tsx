import React from 'react';
import SearchFiltersCurrencyBase from '@components/Search/SearchFiltersCurrencyBase';
import CONST from '@src/CONST';

function SearchFiltersGroupCurrencyPage() {
    return (
        <SearchFiltersCurrencyBase
            title="common.groupCurrency"
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY}
        />
    );
}

export default SearchFiltersGroupCurrencyPage;
