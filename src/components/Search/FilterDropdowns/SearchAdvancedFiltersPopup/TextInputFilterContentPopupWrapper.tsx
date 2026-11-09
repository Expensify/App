import type {TextInputFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import TextInputFilterContent, {shouldTextFilterGrow, TextInputFilterContentFillHeight} from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import useThemeStyles from '@hooks/useThemeStyles';

import {isFilterNegatable} from '@libs/SearchQueryUtils';

import React from 'react';

function TextInputFilterContentPopupWrapper({baseFilterKey, value, isNegated, onChange}: TextInputFilterContentWrapperProps) {
    const styles = useThemeStyles();
    const isFilterKeyNegatable = isFilterNegatable(baseFilterKey);
    const style = [isFilterKeyNegatable ? styles.pt6 : styles.pt5];

    if (shouldTextFilterGrow(baseFilterKey)) {
        return (
            <TextInputFilterContentFillHeight
                baseFilterKey={baseFilterKey}
                value={value}
                isNegated={isNegated}
                style={style}
                shouldUseWebViewportHeightFallback={false}
                onChange={onChange}
            />
        );
    }

    return (
        <TextInputFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            style={style}
            onChange={onChange}
        />
    );
}

export default TextInputFilterContentPopupWrapper;
