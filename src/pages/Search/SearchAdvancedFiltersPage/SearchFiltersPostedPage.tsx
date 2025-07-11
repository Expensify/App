import React from 'react';
import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';
import CONST from '@src/CONST';

function SearchFiltersPostedPage() {
    return (
        <SearchDatePresetFilterBasePage
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED}
            titleKey="search.filters.posted"
            presets={CONST.SEARCH.FILTER_DATE_PRESETS[CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED]}
        />
    );
}

SearchFiltersPostedPage.displayName = 'SearchFiltersPostedPage';

export default SearchFiltersPostedPage;
