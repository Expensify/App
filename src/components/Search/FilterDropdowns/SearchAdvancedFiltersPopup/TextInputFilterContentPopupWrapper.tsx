import type {TextInputFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import TextInputFilterContent from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

function TextInputFilterContentPopupWrapper({filterKey, value, merchantOperator, onChange}: TextInputFilterContentWrapperProps) {
    const styles = useThemeStyles();
    return (
        <TextInputFilterContent
            filterKey={filterKey}
            value={value}
            merchantOperator={merchantOperator}
            style={[styles.pt5]}
            onChange={onChange}
        />
    );
}

export default TextInputFilterContentPopupWrapper;
