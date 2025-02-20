import React from 'react';
import SearchDateFilterBase from '@components/Search/SearchDateFilterBase';
import CONST from '@src/CONST';

function SearchFiltersDatePage() {
    return (
        <SearchDateFilterBase
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE}
            titleKey="common.date"
        />
    );
}

SearchFiltersDatePage.displayName = 'SearchFiltersDatePage';

export default SearchFiltersDatePage;
