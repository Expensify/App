import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';

import CONST from '@src/CONST';

import React from 'react';

function SearchFiltersKeywordPage() {
    return (
        <SearchFiltersTextBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD}
            titleKey="search.filters.keyword"
            testID="SearchFiltersKeywordPage"
            characterLimit={CONST.MAX_COMMENT_LENGTH}
        />
    );
}

export default SearchFiltersKeywordPage;
