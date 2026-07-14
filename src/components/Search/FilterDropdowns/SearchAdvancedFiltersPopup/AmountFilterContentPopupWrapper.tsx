import AmountFilterContent from '@components/Search/FilterComponents/AdvancedFilters/AmountFilterContent';
import type {AmountFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
function AmountFilterContentPopupWrapper({baseFilterKey, value, onChange}: AmountFilterContentWrapperProps) {
    const styles = useThemeStyles();
    return (
        <AmountFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            style={[styles.pt2]}
            onChange={onChange}
        />
    );
}

export default AmountFilterContentPopupWrapper;
