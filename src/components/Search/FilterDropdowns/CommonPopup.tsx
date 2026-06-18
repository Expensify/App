import React, {useState} from 'react';
import FilterComponents from '@components/Search/FilterComponents';
import type {FilterComponentsProps} from '@components/Search/FilterComponents';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';
import useFilterNegatableValue from '../hooks/useFilterNegatableValue';
import useGetFilterFormValues from '../hooks/useGetFilterFormValues';
import BasePopup from './BasePopup';
import type {PopoverComponentProps} from './FilterPopupButton';

type CommonPopupProps = Pick<FilterComponentsProps, 'baseFilterKey' | 'policyIDQuery'> & {
    values: Partial<SearchAdvancedFiltersForm> | undefined;
    label: string;
    closeOverlay: PopoverComponentProps['closeOverlay'];
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
};

function CommonPopup({baseFilterKey, values, label, policyIDQuery, updateFilterForm, closeOverlay}: CommonPopupProps) {
    const {isNegated: initialIsNegated, value: initialValue} = useFilterNegatableValue(baseFilterKey, values);
    const [value, setValue] = useState(initialValue);
    const [isNegated, setIsNegated] = useState(initialIsNegated);
    const getFilterFormValues = useGetFilterFormValues();

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
                policyIDQuery={policyIDQuery}
                onChange={setValue}
                onNegationChange={setIsNegated}
            />
        </BasePopup>
    );
}

export default CommonPopup;
