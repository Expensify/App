import React from 'react';
import DateSelectPopup from '@components/Search/FilterDropdowns/DateSelectPopup';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import type {SearchDateFilterKeys} from '@components/Search/types';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {SearchDateValues} from '@libs/SearchQueryUtils';
import {getDatePresets} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

type DatePickerFilterPopupProps = PopoverComponentProps & {
    filterKey: SearchDateFilterKeys;
    value: SearchDateValues;
    translationKey: TranslationPaths;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function DatePickerFilterPopup({closeOverlay, setPopoverWidth, filterKey, value, translationKey, updateFilterForm}: DatePickerFilterPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const isInLandscapeMode = useIsInLandscapeMode();
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
            label={translate(translationKey)}
            value={value}
            onChange={onChange}
            closeOverlay={closeOverlay}
            setPopoverWidth={setPopoverWidth}
            presets={getDatePresets(filterKey, true)}
            style={[styles.getPopoverMaxHeight(windowHeight, isInLandscapeMode)]}
        />
    );
}

export default DatePickerFilterPopup;
export type {DatePickerFilterPopupProps};
