import React from 'react';
import SearchDatePresetFilterBase from '@components/Search/SearchDatePresetFilterBase';
import CONST from '@src/CONST';

function SearchFiltersPaidPage() {
    return (
        <SearchDatePresetFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID}
            titleKey="search.filters.paid"
        />
    );
}

SearchFiltersPaidPage.displayName = 'SearchFiltersPaidPage';

export default SearchFiltersPaidPage;
