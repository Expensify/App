import AmountFilterContent from '@components/Search/FilterComponents/AdvancedFilters/AmountFilterContent';
import type {AmountFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import React from 'react';

function AmountFilterContentPageWrapper({baseFilterKey, value, onChange}: AmountFilterContentWrapperProps) {
    return (
        <AmountFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            largeButton
            autoFocus
            onChange={onChange}
        />
    );
}

export default AmountFilterContentPageWrapper;
