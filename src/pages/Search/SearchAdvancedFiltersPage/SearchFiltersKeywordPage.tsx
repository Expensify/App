import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import CONST from '@src/CONST';

function SearchFiltersKeywordPage() {
    return (
        <SearchFiltersTextBase
            filterKey="keyword"
            titleKey="search.filters.keyword"
            testID={SearchFiltersKeywordPage.displayName}
            shouldShowFullPageNotFoundView
            characterLimit={CONST.MAX_COMMENT_LENGTH}
        />
    );
}

SearchFiltersKeywordPage.displayName = 'SearchFiltersKeywordPage';

export default SearchFiltersKeywordPage;
