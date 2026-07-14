import FilterComponents from '@components/Search/FilterComponents';
import type {CommonFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

function CommonFilterContentPopupWrapper({filterKey, value, type, policyID, onChange}: CommonFilterContentWrapperProps) {
    const styles = useThemeStyles();
    return (
        <FilterComponents
            filterKey={filterKey}
            value={value}
            type={type}
            policyID={policyID}
            selectionListTextInputStyle={[styles.pb1, styles.pt5]}
            selectionListStyle={{contentContainerStyle: [styles.pv2]}}
            onChange={onChange}
        />
    );
}

export default CommonFilterContentPopupWrapper;
