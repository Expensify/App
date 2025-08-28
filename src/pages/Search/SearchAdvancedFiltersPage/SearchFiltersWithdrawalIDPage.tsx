import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';


function SearchFiltersWithdrawalIDPage() {
    return (
        <SearchFiltersTextBase
            filterKey="withdrawalID"
            titleKey="common.withdrawalID"
            testID={SearchFiltersWithdrawalIDPage.displayName}
        />
    );
}

SearchFiltersWithdrawalIDPage.displayName = 'SearchFiltersWithdrawalIDPage';

export default SearchFiltersWithdrawalIDPage;
