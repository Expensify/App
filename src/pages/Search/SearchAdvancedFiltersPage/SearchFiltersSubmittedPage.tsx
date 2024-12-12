import React from 'react';
import SearchDateFilterBase from '@components/Search/SearchDateFilterBase';
import CONST from '@src/CONST';

function SearchFiltersSubmittedPage() {
    return (
        <SearchDateFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED}
            titleKey="search.filters.submitted"
        />
    );
}

SearchFiltersSubmittedPage.displayName = 'SearchFiltersSubmittedPage';

export default SearchFiltersSubmittedPage;
