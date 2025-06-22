import React from 'react';
import SearchDatePresetFilterBase from '@components/Search/SearchDatePresetFilterBase';
import CONST from '@src/CONST';

function SearchFiltersPostedPage() {
    return (
        <SearchDatePresetFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED}
            titleKey="search.filters.posted"
        />
    );
}

SearchFiltersPostedPage.displayName = 'SearchFiltersPostedPage';

export default SearchFiltersPostedPage;
