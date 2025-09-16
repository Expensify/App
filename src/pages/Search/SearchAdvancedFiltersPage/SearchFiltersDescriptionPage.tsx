import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import CONST from '@src/CONST';

function SearchFiltersDescriptionPage() {
    return (
        <SearchFiltersTextBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION}
            titleKey="common.description"
            testID={SearchFiltersDescriptionPage.displayName}
            characterLimit={CONST.DESCRIPTION_LIMIT}
        />
    );
}

SearchFiltersDescriptionPage.displayName = 'SearchFiltersDescriptionPage';

export default SearchFiltersDescriptionPage;
