import AmountFilterContent from '@components/Search/FilterComponents/AdvancedFilters/AmountFilterContent';
import type {AmountFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import React from 'react';

function AmountFilterContentPageWrapper({filterKey, value, onChange}: AmountFilterContentWrapperProps) {
    return (
        <AmountFilterContent
            filterKey={filterKey}
            value={value}
            largeButton
            autoFocus
            onChange={onChange}
        />
    );
}

export default AmountFilterContentPageWrapper;
