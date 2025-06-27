import React from 'react';
import SearchDatePresetFilterBase from '@components/Search/SearchDatePresetFilterBase';
import CONST from '@src/CONST';

function SearchFiltersApprovedPage() {
    return (
        <SearchDatePresetFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED}
            titleKey="search.filters.approved"
        />
    );
}

SearchFiltersApprovedPage.displayName = 'SearchFiltersApprovedPage';

export default SearchFiltersApprovedPage;
