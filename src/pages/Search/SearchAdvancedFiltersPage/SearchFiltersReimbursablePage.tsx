import React from 'react';
import SearchBooleanFilterBasePage from '@components/Search/SearchBooleanFilterBasePage';
import CONST from '@src/CONST';

function SearchFiltersReimbursablePage() {
    return (
        <SearchBooleanFilterBasePage
            booleanKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE}
            titleKey="search.filters.reimbursable"
        />
    );
}

export default SearchFiltersReimbursablePage;
