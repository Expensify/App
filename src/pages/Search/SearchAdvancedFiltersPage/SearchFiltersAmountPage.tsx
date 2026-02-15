import React from 'react';
import SearchFiltersAmountBase from '@components/Search/SearchFiltersAmountBase';
import CONST from '@src/CONST';

function SearchFiltersAmountPage() {
    return (
        <SearchFiltersAmountBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
            title="iou.amount"
            testID="SearchFiltersAmountPage"
        />
    );
}

export default SearchFiltersAmountPage;
