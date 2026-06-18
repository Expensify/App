import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';

import CONST from '@src/CONST';

import React from 'react';

function SearchFiltersDatePage() {
    return (
        <SearchDatePresetFilterBasePage
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE}
            titleKey="common.date"
        />
    );
}

export default SearchFiltersDatePage;
