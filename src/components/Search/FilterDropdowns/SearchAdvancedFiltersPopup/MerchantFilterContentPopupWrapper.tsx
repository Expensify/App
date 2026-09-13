import MerchantFilterContent from '@components/Search/FilterComponents/AdvancedFilters/MerchantFilterContent';
import type {MerchantFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

function MerchantFilterContentPopupWrapper({baseFilterKey, value, isNegated, merchantOperator, onChange}: MerchantFilterContentWrapperProps) {
    const styles = useThemeStyles();

    return (
        <MerchantFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            merchantOperator={merchantOperator}
            style={[styles.pt6]}
            onChange={onChange}
        />
    );
}

export default MerchantFilterContentPopupWrapper;
