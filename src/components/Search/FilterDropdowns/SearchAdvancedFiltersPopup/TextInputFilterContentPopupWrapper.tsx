import type {TextInputFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import TextInputFilterContent from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import useThemeStyles from '@hooks/useThemeStyles';

import {isFilterNegatable} from '@libs/SearchQueryUtils';

import React from 'react';

function TextInputFilterContentPopupWrapper({baseFilterKey, value, isNegated, onChange}: TextInputFilterContentWrapperProps) {
    const styles = useThemeStyles();
    const isFilterKeyNegatable = isFilterNegatable(baseFilterKey);

    return (
        <TextInputFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            style={[isFilterKeyNegatable ? styles.pt6 : styles.pt5]}
            onChange={onChange}
        />
    );
}

export default TextInputFilterContentPopupWrapper;
