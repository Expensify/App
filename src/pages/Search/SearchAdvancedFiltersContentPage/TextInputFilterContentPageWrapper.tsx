import React from 'react';
import type {TextInputFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import TextInputFilterContent from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

function TextInputFilterContentPageWrapper({filterKey, value, merchantOperator, onChange}: TextInputFilterContentWrapperProps) {
    return (
        <TextInputFilterContent
            filterKey={filterKey}
            value={value}
            merchantOperator={merchantOperator}
            autoFocus
            largeButton
            onChange={onChange}
        />
    );
}

export default TextInputFilterContentPageWrapper;
