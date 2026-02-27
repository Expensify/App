import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import CONST from '@src/CONST';

function SearchFiltersReportIDPage() {
    return (
        <SearchFiltersTextBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID}
            titleKey="common.reportID"
            testID="SearchFiltersReportIDPage"
            characterLimit={CONST.MAX_COMMENT_LENGTH}
        />
    );
}

export default SearchFiltersReportIDPage;
