import React from 'react';
import type {TextInputFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import TextInputFilterContent from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';
import useThemeStyles from '@hooks/useThemeStyles';

function TextInputFilterContentPopupWrapper({filterKey, value, onChange}: TextInputFilterContentWrapperProps) {
    const styles = useThemeStyles();
    return (
        <TextInputFilterContent
            filterKey={filterKey}
            value={value}
            style={[styles.pt5]}
            onChange={onChange}
        />
    );
}

export default TextInputFilterContentPopupWrapper;
