import type {TextInputFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import TextInputFilterContent from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import React from 'react';

function TextInputFilterContentPageWrapper({filterKey, value, onChange}: TextInputFilterContentWrapperProps) {
    return (
        <TextInputFilterContent
            filterKey={filterKey}
            value={value}
            autoFocus
            largeButton
            onChange={onChange}
        />
    );
}

export default TextInputFilterContentPageWrapper;
