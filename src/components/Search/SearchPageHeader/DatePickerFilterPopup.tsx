import React from 'react';
import DateSelectPopup from '@components/Search/FilterDropdowns/DateSelectPopup';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import type {SearchDateFilterKeys} from '@components/Search/types';
import type {SearchDateValues} from '@libs/SearchQueryUtils';
import {getDatePresets} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

type DatePickerFilterPopupProps = Pick<PopoverComponentProps, 'closeOverlay' | 'setPopoverWidth'> & {
    filterKey: SearchDateFilterKeys;
    value: SearchDateValues;
    label: string;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function DatePickerFilterPopup({closeOverlay, setPopoverWidth, filterKey, value, label, updateFilterForm}: DatePickerFilterPopupProps) {
    const onChange = (selectedDates: SearchDateValues) => {
        const dateFormValues: Record<string, string | undefined> = {};
        dateFormValues[`${filterKey}On`] = selectedDates[CONST.SEARCH.DATE_MODIFIERS.ON];
        dateFormValues[`${filterKey}After`] = selectedDates[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        dateFormValues[`${filterKey}Before`] = selectedDates[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
        dateFormValues[`${filterKey}Range`] = selectedDates[CONST.SEARCH.DATE_MODIFIERS.RANGE];
        updateFilterForm(dateFormValues as Partial<SearchAdvancedFiltersForm>);
    };
    return (
        <DateSelectPopup
            label={label}
            value={value}
            onChange={onChange}
            closeOverlay={closeOverlay}
            setPopoverWidth={setPopoverWidth}
            presets={getDatePresets(filterKey, true)}
        />
    );
}

export default DatePickerFilterPopup;
export type {DatePickerFilterPopupProps};
