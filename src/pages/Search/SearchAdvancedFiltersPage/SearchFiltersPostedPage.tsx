import React from 'react';
import SearchDatePresetFilterBase from '@components/Search/SearchDatePresetFilterBase';
import CONST from '@src/CONST';

function SearchFiltersPostedPage() {
    const presets = [CONST.SEARCH.DATE_PRESETS.LAST_MONTH];

    return (
        <SearchDatePresetFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED}
            titleKey="search.filters.posted"
            presets={presets}
        />
    );
}

SearchFiltersPostedPage.displayName = 'SearchFiltersPostedPage';

export default SearchFiltersPostedPage;
