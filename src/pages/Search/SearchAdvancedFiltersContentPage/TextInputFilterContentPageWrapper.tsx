import type {TextInputFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import {TextInputFilterContentFillHeight} from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import CONST from '@src/CONST';

import React from 'react';

function TextInputFilterContentPageWrapper({baseFilterKey, value, isNegated, onChange}: TextInputFilterContentWrapperProps) {
    return (
        <TextInputFilterContentFillHeight
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            autoFocus
            size={CONST.BUTTON_SIZE.LARGE}
            onChange={onChange}
        />
    );
}

export default TextInputFilterContentPageWrapper;
