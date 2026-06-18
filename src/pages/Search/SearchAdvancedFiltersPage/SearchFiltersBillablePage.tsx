import SearchBooleanFilterBasePage from '@components/Search/SearchBooleanFilterBasePage';

import CONST from '@src/CONST';

import React from 'react';

function SearchFiltersBillablePage() {
    return (
        <SearchBooleanFilterBasePage
            booleanKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE}
            titleKey="search.filters.billable"
        />
    );
}

export default SearchFiltersBillablePage;
