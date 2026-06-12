import React from 'react';
import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';
import CONST from '@src/CONST';

function SearchFiltersWithdrawnPage() {
    return (
        <SearchDatePresetFilterBasePage
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN}
            titleKey="search.filters.withdrawn"
        />
    );
}

export default SearchFiltersWithdrawnPage;
