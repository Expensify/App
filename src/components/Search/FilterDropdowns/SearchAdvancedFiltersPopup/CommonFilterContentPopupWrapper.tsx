import React from 'react';
import CommonFilterContent from '@components/Search/FilterComponents/AdvancedFilters/CommonFilterContent';
import type {CommonFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useThemeStyles from '@hooks/useThemeStyles';

function CommonFilterContentPopupWrapper({filterKey, value, type, policyID, onChange}: CommonFilterContentWrapperProps) {
    const styles = useThemeStyles();
    return (
        <CommonFilterContent
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
