import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';

import CONST from '@src/CONST';

import React from 'react';

function SearchFiltersDescriptionPage() {
    return (
        <SearchFiltersTextBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION}
            titleKey="common.description"
            testID="SearchFiltersDescriptionPage"
            characterLimit={CONST.DESCRIPTION_LIMIT}
        />
    );
}

export default SearchFiltersDescriptionPage;
