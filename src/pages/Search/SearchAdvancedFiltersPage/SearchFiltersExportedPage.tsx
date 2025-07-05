import React from 'react';
import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';
import CONST from '@src/CONST';

function SearchFiltersExportedPage() {
    return (
        <SearchDatePresetFilterBasePage
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED}
            titleKey="search.filters.exported"
            presets={[CONST.SEARCH.DATE_PRESETS.NEVER]}
        />
    );
}

SearchFiltersExportedPage.displayName = 'SearchFiltersExportedPage';

export default SearchFiltersExportedPage;
