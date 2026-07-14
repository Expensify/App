import FilterComponents from '@components/Search/FilterComponents';
import type {CommonFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useThemeStyles from '@hooks/useThemeStyles';

import {isFilterNegatable} from '@libs/SearchQueryUtils';

import React, {useState} from 'react';

function CommonFilterContentPopupWrapper({baseFilterKey, value, isNegated: initialIsNegated, type, policyID, onChange}: CommonFilterContentWrapperProps) {
    const styles = useThemeStyles();
    const [isNegated, setIsNegated] = useState(initialIsNegated);
    const isFilterKeyNegatable = isFilterNegatable(baseFilterKey);

    return (
        <FilterComponents
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            type={type}
            policyID={policyID}
            style={[styles.mt6]}
            selectionListTextInputStyle={[!isFilterKeyNegatable && [styles.pt5, styles.pb1]]}
            selectionListStyle={{contentContainerStyle: [isFilterKeyNegatable ? styles.pb2 : styles.pv2]}}
            onChange={(newValue) => onChange(newValue, isNegated)}
            onNegationChange={(negated) => {
                setIsNegated(negated);
                if (!value?.length) {
                    return;
                }
                onChange(value, negated);
            }}
        />
    );
}

export default CommonFilterContentPopupWrapper;
