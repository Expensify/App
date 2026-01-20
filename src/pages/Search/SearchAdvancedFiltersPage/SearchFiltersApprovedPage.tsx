import React from 'react';
import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';
import CONST from '@src/CONST';

function SearchFiltersApprovedPage() {
    return (
        <SearchDatePresetFilterBasePage
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED}
            titleKey="search.filters.approved"
        />
    );
}

export default SearchFiltersApprovedPage;
