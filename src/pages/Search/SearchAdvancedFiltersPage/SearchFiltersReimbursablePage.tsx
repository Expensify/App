import SearchBooleanFilterBasePage from '@components/Search/SearchBooleanFilterBasePage';

import CONST from '@src/CONST';

import React from 'react';

function SearchFiltersReimbursablePage() {
    return (
        <SearchBooleanFilterBasePage
            booleanKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE}
            titleKey="search.filters.reimbursable"
        />
    );
}

export default SearchFiltersReimbursablePage;
