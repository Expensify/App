import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';

function SearchFiltersKeywordPage() {
    return (
        <SearchFiltersTextBase
            filterKey="keyword"
            titleKey="search.filters.keyword"
            testID={SearchFiltersKeywordPage.displayName}
            shouldShowFullPageNotFoundView
        />
    );
}

SearchFiltersKeywordPage.displayName = 'SearchFiltersKeywordPage';

export default SearchFiltersKeywordPage;
