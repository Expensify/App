import React from 'react';
import CONST from '@src/CONST';
import SearchFiltersAmountBase from '@components/Search/SearchFiltersAmountBase';

function SearchFiltersAmountPage() {
    return (
        <SearchFiltersAmountBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
            title="iou.amount"
        />
    );
}

SearchFiltersAmountPage.displayName = 'SearchFiltersAmountPage';

export default SearchFiltersAmountPage;
