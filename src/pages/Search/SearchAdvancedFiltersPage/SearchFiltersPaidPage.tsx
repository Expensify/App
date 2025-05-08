import React from 'react';
import SearchDateFilterBase from '@components/Search/SearchDateFilterBase';
import CONST from '@src/CONST';

function SearchFiltersPaidPage() {
    return (
        <SearchDateFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID}
            titleKey="search.filters.paid"
        />
    );
}

SearchFiltersPaidPage.displayName = 'SearchFiltersPaidPage';

export default SearchFiltersPaidPage;
