import React from 'react';
import SearchDatePresetFilterBase from '@components/Search/SearchDatePresetFilterBase';
import CONST from '@src/CONST';

function SearchFiltersSubmittedPage() {
    return (
        <SearchDatePresetFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED}
            titleKey="search.filters.submitted"
        />
    );
}

SearchFiltersSubmittedPage.displayName = 'SearchFiltersSubmittedPage';

export default SearchFiltersSubmittedPage;
