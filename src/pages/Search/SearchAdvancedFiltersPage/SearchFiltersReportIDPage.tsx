import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';


function SearchFiltersReportIDPage() {
    return (
        <SearchFiltersTextBase
            filterKey="reportID"
            titleKey="common.reportID"
            testID={SearchFiltersReportIDPage.displayName}
        />
    );
}

SearchFiltersReportIDPage.displayName = 'SearchFiltersReportIDPage';

export default SearchFiltersReportIDPage;
