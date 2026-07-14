import FilterComponents from '@components/Search/FilterComponents';
import type {FilterComponentsProps} from '@components/Search/FilterComponents';

import {getFilterFormValues} from '@libs/SearchQueryUtils';
import {getFilterNegatableValue} from '@libs/SearchUIUtils';

import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';

import React, {useState} from 'react';

import type {PopoverComponentProps} from './FilterPopupButton';

import BasePopup from './BasePopup';

type CommonPopupProps = Pick<FilterComponentsProps, 'baseFilterKey'> & {
    values: Partial<SearchAdvancedFiltersForm> | undefined;
    label: string;
    closeOverlay: PopoverComponentProps['closeOverlay'];
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
};

function CommonPopup({baseFilterKey, values, label, updateFilterForm, closeOverlay}: CommonPopupProps) {
    const {isNegated: initialIsNegated, value: initialValue} = getFilterNegatableValue(baseFilterKey, values);
    const [value, setValue] = useState(initialValue);
    const [isNegated, setIsNegated] = useState(initialIsNegated);

    const applyChanges = () => {
        updateFilterForm(getFilterFormValues(baseFilterKey, value, isNegated));
        closeOverlay();
    };

    return (
        <BasePopup
            label={label}
            onApply={applyChanges}
            applySentryLabel={`Search-FilterPopupApply-${baseFilterKey}`}
        >
            <FilterComponents
                baseFilterKey={baseFilterKey}
                value={value}
                isNegated={isNegated}
                type={values?.type}
                policyIDs={values?.policyID}
                onChange={setValue}
                onNegationChange={setIsNegated}
            />
        </BasePopup>
    );
}

export default CommonPopup;
