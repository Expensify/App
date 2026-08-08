import type {TextInputFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import TextInputFilterContent from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import React from 'react';

function TextInputFilterContentPageWrapper({baseFilterKey, value, isNegated, buttonText, onChange}: TextInputFilterContentWrapperProps) {
    return (
        <TextInputFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            autoFocus
            largeButton
            buttonText={buttonText}
            onChange={onChange}
        />
    );
}

export default TextInputFilterContentPageWrapper;
