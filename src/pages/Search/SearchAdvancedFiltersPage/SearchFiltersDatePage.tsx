import React from 'react';
import SearchDatePresetFilterBase from '@components/Search/SearchDatePresetFilterBase';
import CONST from '@src/CONST';

function SearchFiltersDatePage() {
    return (
        <SearchDatePresetFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE}
            titleKey="common.date"
        />
    );
}

SearchFiltersDatePage.displayName = 'SearchFiltersDatePage';

export default SearchFiltersDatePage;
