import React from 'react';
import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';
import useEnvironment from '@hooks/useEnvironment';
import CONST from '@src/CONST';

function SearchFiltersPostedPage() {
    const {isDevelopment} = useEnvironment();

    // s77rt remove DEV lock
    const presets = isDevelopment ? [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT, CONST.SEARCH.DATE_PRESETS.LAST_MONTH] : undefined;

    return (
        <SearchDatePresetFilterBasePage
            dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED}
            titleKey="search.filters.posted"
            presets={presets}
        />
    );
}

SearchFiltersPostedPage.displayName = 'SearchFiltersPostedPage';

export default SearchFiltersPostedPage;
