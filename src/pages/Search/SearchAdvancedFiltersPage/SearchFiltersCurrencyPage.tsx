import SearchFiltersCurrencyBase from '@components/Search/SearchFiltersCurrencyBase';

import CONST from '@src/CONST';

import React from 'react';

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
