import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import CONST from '@src/CONST';

function SearchFiltersWithdrawalIDPage() {
    return (
        <SearchFiltersTextBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID}
            titleKey="common.withdrawalID"
            testID={SearchFiltersWithdrawalIDPage.displayName}
            characterLimit={CONST.MAX_COMMENT_LENGTH}
        />
    );
}

SearchFiltersWithdrawalIDPage.displayName = 'SearchFiltersWithdrawalIDPage';

export default SearchFiltersWithdrawalIDPage;
