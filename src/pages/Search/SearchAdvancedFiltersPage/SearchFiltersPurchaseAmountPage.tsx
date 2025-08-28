import React from 'react';
import SearchFiltersPurchaseAmountBase from '@components/Search/SearchFiltersAmountBase';
import CONST from '@src/CONST';

function SearchFiltersPurchaseAmountPage() {
    return (
        <SearchFiltersPurchaseAmountBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT}
            title="iou.amount"
            testID={SearchFiltersPurchaseAmountPage.displayName}
        />
    );
}

SearchFiltersPurchaseAmountPage.displayName = 'SearchFiltersPurchaseAmountPage';

export default SearchFiltersPurchaseAmountPage;
