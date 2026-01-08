import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import CONST from '@src/CONST';

function SearchFiltersWithdrawalIDPage() {
    return (
        <SearchFiltersTextBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID}
            titleKey="common.withdrawalID"
            testID="SearchFiltersWithdrawalIDPage"
            characterLimit={CONST.MAX_COMMENT_LENGTH}
        />
    );
}

export default SearchFiltersWithdrawalIDPage;
