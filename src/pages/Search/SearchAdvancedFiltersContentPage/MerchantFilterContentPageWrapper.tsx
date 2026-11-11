import MerchantFilterContent from '@components/Search/FilterComponents/AdvancedFilters/MerchantFilterContent';
import type {MerchantFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import CONST from '@src/CONST';

import React from 'react';

function MerchantFilterContentPageWrapper({baseFilterKey, value, isNegated, merchantOperator, buttonText, onChange}: MerchantFilterContentWrapperProps) {
    return (
        <MerchantFilterContent
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_SAVE_BUTTON}
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            merchantOperator={merchantOperator}
            buttonSize={CONST.BUTTON_SIZE.LARGE}
            buttonText={buttonText}
            autoFocus
            onChange={onChange}
        />
    );
}

export default MerchantFilterContentPageWrapper;
