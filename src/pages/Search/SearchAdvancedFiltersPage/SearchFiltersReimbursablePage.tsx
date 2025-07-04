import React from 'react';
import SearchBooleanFilterBase from '@components/Search/SearchBooleanFilterBase';
import CONST from '@src/CONST';

function SearchFiltersReimbursablePage() {
    return (
        <SearchBooleanFilterBase
            booleanKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE}
            titleKey="search.filters.reimbursable"
        />
    );
}

SearchFiltersReimbursablePage.displayName = 'SearchFiltersReimbursablePage';

export default SearchFiltersReimbursablePage;
