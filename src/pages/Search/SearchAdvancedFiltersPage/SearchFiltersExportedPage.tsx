import React from 'react';
import SearchDateFilterBase from '@components/Search/SearchDateFilterBase';
import CONST from '@src/CONST';

function SearchFiltersExportedPage() {
    return (
        <SearchDateFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED}
            titleKey="search.filters.exported"
        />
    );
}

SearchFiltersExportedPage.displayName = 'SearchFiltersExportedPage';

export default SearchFiltersExportedPage;
