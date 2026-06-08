import React, {useState} from 'react';
import FilterComponents from '@components/Search/FilterComponents';
import type {FilterComponentsProps} from '@components/Search/FilterComponents';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';
import BasePopup from './BasePopup';
import type {PopoverComponentProps} from './DropdownButton';

type CommonPopupProps = {
    filterKey: FilterComponentsProps['filterKey'];
    value: FilterComponentsProps['value'];
    label: string;
    policyIDQuery: string[] | undefined;
    closeOverlay: PopoverComponentProps['closeOverlay'];
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
};

function CommonPopup({filterKey, value: initialValue, label, policyIDQuery, updateFilterForm, closeOverlay}: CommonPopupProps) {
    const [value, setValue] = useState(initialValue);

    const applyChanges = () => {
        updateFilterForm({[filterKey]: value} as Partial<SearchAdvancedFiltersForm>);
        closeOverlay();
    };

    const resetChanges = () => {
        updateFilterForm({[filterKey]: undefined});
        closeOverlay();
    };

    return (
        <BasePopup
            label={label}
            onApply={applyChanges}
            onReset={resetChanges}
            applySentryLabel={`Search-FilterPopupApply-${filterKey}`}
            resetSentryLabel={`Search-FilterPopupReset-${filterKey}`}
        >
            <FilterComponents
                filterKey={filterKey}
                value={value}
                policyIDQuery={policyIDQuery}
                onChange={setValue}
            />
        </BasePopup>
    );
}

export default CommonPopup;
