import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';

import CONST from '@src/CONST';

import React from 'react';

function SearchFiltersExportedPage() {
    return (
        <SearchDatePresetFilterBasePage
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED}
            titleKey="search.filters.exported"
        />
    );
}

export default SearchFiltersExportedPage;
