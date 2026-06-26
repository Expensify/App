import React, {useState} from 'react';
import FilterComponents from '@components/Search/FilterComponents';
import type {CommonFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFilterNegatable} from '@libs/SearchQueryUtils';

function CommonFilterContentPopupWrapper({baseFilterKey, value, isNegated: initialIsNegated, type, policyIDs, policyIDQuery, onChange}: CommonFilterContentWrapperProps) {
    const styles = useThemeStyles();
    const [isNegated, setIsNegated] = useState(initialIsNegated);
    const isFilterKeyNegatable = isFilterNegatable(baseFilterKey);

    return (
        <FilterComponents
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            type={type}
            policyIDs={policyIDs}
            policyIDQuery={policyIDQuery}
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
