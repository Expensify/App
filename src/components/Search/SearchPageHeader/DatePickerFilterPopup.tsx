import DateSelectPopup from '@components/Search/FilterDropdowns/DateSelectPopup';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {SearchDateFilterKeys} from '@components/Search/types';

import type {SearchDateValues} from '@libs/SearchQueryUtils';
import {getDatePresets} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React from 'react';

type DatePickerFilterPopupProps = Pick<PopoverComponentProps, 'closeOverlay' | 'setPopoverWidth'> & {
    baseFilterKey: SearchDateFilterKeys;
    value: SearchDateValues;
    label: string;
    hasFeed: boolean;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function DatePickerFilterPopup({closeOverlay, setPopoverWidth, baseFilterKey, value, label, hasFeed, updateFilterForm}: DatePickerFilterPopupProps) {
    const onChange = (selectedDates: SearchDateValues) => {
        const dateFormValues: Record<string, string | undefined> = {};
        dateFormValues[`${baseFilterKey}On`] = selectedDates[CONST.SEARCH.DATE_MODIFIERS.ON];
        dateFormValues[`${baseFilterKey}After`] = selectedDates[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        dateFormValues[`${baseFilterKey}Before`] = selectedDates[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
        dateFormValues[`${baseFilterKey}Range`] = selectedDates[CONST.SEARCH.DATE_MODIFIERS.RANGE];
        updateFilterForm(dateFormValues as Partial<SearchAdvancedFiltersForm>);
    };
    return (
        <DateSelectPopup
            label={label}
            value={value}
            onChange={onChange}
            closeOverlay={closeOverlay}
            setPopoverWidth={setPopoverWidth}
            presets={getDatePresets(baseFilterKey, hasFeed)}
        />
    );
}

export default DatePickerFilterPopup;
