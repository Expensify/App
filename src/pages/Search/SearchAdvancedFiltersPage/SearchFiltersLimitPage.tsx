import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import CONST from '@src/CONST';

function SearchFiltersLimitPage() {
    return (
        <SearchFiltersTextBase
            filterKey={CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT}
            titleKey="search.filters.limit"
            descriptionKey="search.filters.limitDescription"
            testID="SearchFiltersLimitPage"
        />
    );
}

export default SearchFiltersLimitPage;
