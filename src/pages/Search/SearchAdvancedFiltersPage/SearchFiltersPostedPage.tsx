import React from 'react';
import SearchDateFilterBase from '@components/Search/SearchDateFilterBase';
import CONST from '@src/CONST';

function SearchFiltersPostedPage() {
    return (
        <SearchDateFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED}
            titleKey="search.filters.posted"
        />
    );
}

SearchFiltersPostedPage.displayName = 'SearchFiltersPostedPage';

export default SearchFiltersPostedPage;
