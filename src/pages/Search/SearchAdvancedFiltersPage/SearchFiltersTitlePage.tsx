import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import CONST from '@src/CONST';

function SearchFiltersTitlePage() {
    return (
        <SearchFiltersTextBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE}
            titleKey="common.title"
            testID={SearchFiltersTitlePage.displayName}
            characterLimit={CONST.TASK_TITLE_CHARACTER_LIMIT}
        />
    );
}

SearchFiltersTitlePage.displayName = 'SearchFiltersTitlePage';

export default SearchFiltersTitlePage;
