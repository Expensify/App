import FilterComponents from '@components/Search/FilterComponents';
import type {FilterComponentsProps} from '@components/Search/FilterComponents';

import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';

import React, {useState} from 'react';

import type {PopoverComponentProps} from './FilterPopupButton';

import BasePopup from './BasePopup';

type CommonPopupProps = {
    filterKey: FilterComponentsProps['filterKey'];
    value: FilterComponentsProps['value'];
    type: FilterComponentsProps['type'];
    policyIDs: FilterComponentsProps['policyIDs'];
    label: string;
    policyIDQuery: string[] | undefined;
    closeOverlay: PopoverComponentProps['closeOverlay'];
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
};

function CommonPopup({filterKey, value: initialValue, type, policyIDs, label, policyIDQuery, updateFilterForm, closeOverlay}: CommonPopupProps) {
    const [value, setValue] = useState(initialValue);

    const applyChanges = () => {
        updateFilterForm({[filterKey]: value} as Partial<SearchAdvancedFiltersForm>);
        closeOverlay();
    };

    return (
        <BasePopup
            label={label}
            onApply={applyChanges}
            applySentryLabel={`Search-FilterPopupApply-${filterKey}`}
        >
            <FilterComponents
                filterKey={filterKey}
                value={value}
                type={type}
                policyIDs={policyIDs}
                policyIDQuery={policyIDQuery}
                onChange={setValue}
            />
        </BasePopup>
    );
}

export default CommonPopup;
