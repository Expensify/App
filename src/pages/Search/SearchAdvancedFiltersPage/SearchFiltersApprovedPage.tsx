import React from 'react';
import SearchDateFilterBase from '@components/Search/SearchDateFilterBase';
import CONST from '@src/CONST';

function SearchFiltersApprovedPage() {
    return (
        <SearchDateFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED}
            titleKey="search.filters.approved"
        />
    );
}

SearchFiltersApprovedPage.displayName = 'SearchFiltersApprovedPage';

export default SearchFiltersApprovedPage;
