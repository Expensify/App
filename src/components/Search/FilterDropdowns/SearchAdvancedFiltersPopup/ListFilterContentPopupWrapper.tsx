import type {ListFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import ListFilterContent from '@components/Search/FilterComponents/ListFilterContent';

import useThemeStyles from '@hooks/useThemeStyles';

import {isFilterNegatable} from '@libs/SearchQueryUtils';

import React, {useState} from 'react';

function ListFilterContentPopupWrapper({baseFilterKey, value, isNegated: initialIsNegated, type, policyID, onChange}: ListFilterContentWrapperProps) {
    const styles = useThemeStyles();
    const [isNegated, setIsNegated] = useState(initialIsNegated);
    const isFilterKeyNegatable = isFilterNegatable(baseFilterKey);

    return (
        <ListFilterContent
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

export default ListFilterContentPopupWrapper;
