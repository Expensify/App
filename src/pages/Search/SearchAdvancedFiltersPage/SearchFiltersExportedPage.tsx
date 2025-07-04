import React from 'react';
import SearchDatePresetFilterBase from '@components/Search/SearchDatePresetFilterBase';
import CONST from '@src/CONST';

function SearchFiltersExportedPage() {
    return (
        <SearchDatePresetFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED}
            titleKey="search.filters.exported"
            presets={[CONST.SEARCH.DATE_PRESETS.NEVER]}
        />
    );
}

SearchFiltersExportedPage.displayName = 'SearchFiltersExportedPage';

export default SearchFiltersExportedPage;
