import type {TextInputFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import TextInputFilterContent, {shouldTextFilterGrow, TextInputFilterContentFillHeight} from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import useThemeStyles from '@hooks/useThemeStyles';

import {isFilterNegatable} from '@libs/SearchQueryUtils';

import React from 'react';

function TextInputFilterContentPopupWrapper({baseFilterKey, value, isNegated, onChange}: TextInputFilterContentWrapperProps) {
    const styles = useThemeStyles();
    const isFilterKeyNegatable = isFilterNegatable(baseFilterKey);
    const FilterContent = shouldTextFilterGrow(baseFilterKey) ? TextInputFilterContentFillHeight : TextInputFilterContent;

    return (
        <FilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            style={[isFilterKeyNegatable ? styles.pt6 : styles.pt5]}
            shouldUseWebViewportHeightFallback={false}
            onChange={onChange}
        />
    );
}

export default TextInputFilterContentPopupWrapper;
