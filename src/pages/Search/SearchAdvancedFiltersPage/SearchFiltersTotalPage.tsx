import React from 'react';
import SearchFiltersAmountBase from '@components/Search/SearchFiltersAmountBase';
import CONST from '@src/CONST';

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
