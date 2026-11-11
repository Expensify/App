import MerchantFilterContent from '@components/Search/FilterComponents/AdvancedFilters/MerchantFilterContent';
import type {MerchantFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useThemeStyles from '@hooks/useThemeStyles';

import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';

import React from 'react';

function MerchantFilterContentPopupWrapper({baseFilterKey, value, isNegated, merchantOperator, buttonText, onChange}: MerchantFilterContentWrapperProps) {
    const styles = useThemeStyles();

    return (
        <MerchantFilterContent
            sentryLabel={FILTER_VIEW_MAP[baseFilterKey].applySentryLabel}
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            merchantOperator={merchantOperator}
            buttonText={buttonText}
            style={[styles.pt6]}
            onChange={onChange}
        />
    );
}

export default MerchantFilterContentPopupWrapper;
