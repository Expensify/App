import React from 'react';
import SearchFiltersCurrencyBase from '@components/Search/SearchFiltersCurrencyBase';
import CONST from '@src/CONST';

function SearchFiltersCurrencyPage() {
    return (
        <SearchFiltersCurrencyBase
            multiselect
            title="search.filters.currency"
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY}
        />
    );
}

export default SearchFiltersCurrencyPage;
