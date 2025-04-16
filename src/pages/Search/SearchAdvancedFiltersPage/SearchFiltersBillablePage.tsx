import React from 'react';
import SearchBooleanFilterBase from '@components/Search/SearchBooleanFilterBase';
import CONST from '@src/CONST';

function SearchFiltersBillablePage() {
    return (
        <SearchBooleanFilterBase
            booleanKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE}
            titleKey="search.filters.billable"
        />
    );
}

SearchFiltersBillablePage.displayName = 'SearchFiltersBillablePage';

export default SearchFiltersBillablePage;
