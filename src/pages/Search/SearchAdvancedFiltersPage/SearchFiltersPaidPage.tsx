import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';

import CONST from '@src/CONST';

import React from 'react';

function SearchFiltersPaidPage() {
    return (
        <SearchDatePresetFilterBasePage
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID}
            titleKey="search.filters.paid"
        />
    );
}

export default SearchFiltersPaidPage;
