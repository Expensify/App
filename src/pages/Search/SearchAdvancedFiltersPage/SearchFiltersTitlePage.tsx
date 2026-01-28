import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import CONST from '@src/CONST';

function SearchFiltersTitlePage() {
    return (
        <SearchFiltersTextBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE}
            titleKey="common.title"
            testID="SearchFiltersTitlePage"
            characterLimit={CONST.TASK_TITLE_CHARACTER_LIMIT}
        />
    );
}

export default SearchFiltersTitlePage;
