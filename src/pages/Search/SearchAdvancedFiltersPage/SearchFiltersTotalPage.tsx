import SearchFiltersAmountBase from '@components/Search/SearchFiltersAmountBase';

import CONST from '@src/CONST';

import React from 'react';

function SearchFiltersTotalPage() {
    return (
        <SearchFiltersAmountBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL}
            title="common.total"
            testID="SearchFiltersTotalPage"
        />
    );
}

export default SearchFiltersTotalPage;
