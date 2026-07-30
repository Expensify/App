import type {TextInputFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import TextInputFilterContent from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import React from 'react';

function TextInputFilterContentPageWrapper({baseFilterKey, value, isNegated, onChange}: TextInputFilterContentWrapperProps) {
    return (
        <TextInputFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            autoFocus
            largeButton
            onChange={onChange}
        />
    );
}

export default TextInputFilterContentPageWrapper;
