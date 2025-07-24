import React from 'react';
import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';
import CONST from '@src/CONST';

function SearchFiltersSubmittedPage() {
    return (
        <SearchDatePresetFilterBasePage
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED}
            titleKey="search.filters.submitted"
        />
    );
}

SearchFiltersSubmittedPage.displayName = 'SearchFiltersSubmittedPage';

export default SearchFiltersSubmittedPage;
