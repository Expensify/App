import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import CONST from '@src/CONST';

function SearchFiltersTitlePage() {
    return (
        <SearchFiltersTextBase
            filterKey="title"
            titleKey="common.title"
            testID={SearchFiltersTitlePage.displayName}
            shouldHideFixErrorsAlert={false}
            characterLimit={CONST.TASK_TITLE_CHARACTER_LIMIT}
        />
    );
}

SearchFiltersTitlePage.displayName = 'SearchFiltersTitlePage';

export default SearchFiltersTitlePage;
