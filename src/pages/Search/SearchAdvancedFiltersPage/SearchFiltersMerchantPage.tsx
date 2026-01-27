import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import CONST from '@src/CONST';

function SearchFiltersMerchantPage() {
    return (
        <SearchFiltersTextBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
            titleKey="common.merchant"
            testID="SearchFiltersMerchantPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
        />
    );
}

export default SearchFiltersMerchantPage;
