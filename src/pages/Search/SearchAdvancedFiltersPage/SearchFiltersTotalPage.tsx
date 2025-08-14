import React from 'react';
import CONST from '@src/CONST';
import SearchFiltersAmountBase from '@components/Search/SearchFiltersAmountBase';

function SearchFiltersTotalPage() {
    return (
        <SearchFiltersAmountBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL}
            title="common.total"
            testID={SearchFiltersTotalPage.displayName}
        />
    );
}

SearchFiltersTotalPage.displayName = 'SearchFiltersTotalPage';

export default SearchFiltersTotalPage;
