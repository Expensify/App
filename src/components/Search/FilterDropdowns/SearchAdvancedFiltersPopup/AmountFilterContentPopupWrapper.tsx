import React from 'react';
import AmountFilterContent from '@components/Search/FilterComponents/AdvancedFilters/AmountFilterContent';
import type {AmountFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useThemeStyles from '@hooks/useThemeStyles';

function AmountFilterContentPopupWrapper({filterKey, value, onChange}: AmountFilterContentWrapperProps) {
    const styles = useThemeStyles();
    return (
        <AmountFilterContent
            filterKey={filterKey}
            value={value}
            style={[styles.pt2]}
            onChange={onChange}
        />
    );
}

export default AmountFilterContentPopupWrapper;
