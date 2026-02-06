import React from 'react';
import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';
import CONST from '@src/CONST';

function SearchFiltersPostedPage() {
    return (
        <SearchDatePresetFilterBasePage
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED}
            titleKey="search.filters.posted"
        />
    );
}

export default SearchFiltersPostedPage;
