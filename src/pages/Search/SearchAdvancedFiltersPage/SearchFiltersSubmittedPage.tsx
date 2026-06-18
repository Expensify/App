import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';

import CONST from '@src/CONST';

import React from 'react';

function SearchFiltersSubmittedPage() {
    return (
        <SearchDatePresetFilterBasePage
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED}
            titleKey="search.filters.submitted"
        />
    );
}

export default SearchFiltersSubmittedPage;
