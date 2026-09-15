import MerchantFilterContent from '@components/Search/FilterComponents/AdvancedFilters/MerchantFilterContent';
import type {MerchantFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import CONST from '@src/CONST';

import React from 'react';

function MerchantFilterContentPageWrapper({baseFilterKey, value, isNegated, merchantOperator, onChange}: MerchantFilterContentWrapperProps) {
    return (
        <MerchantFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            merchantOperator={merchantOperator}
            buttonSize={CONST.BUTTON_SIZE.LARGE}
            autoFocus
            onChange={onChange}
        />
    );
}

export default MerchantFilterContentPageWrapper;
