import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import type {DateFilterBaseHandle} from '@components/Search/FilterComponents/DateFilterBase';
import useFullscreenAdvancedFilters from '@components/Search/FilterDropdowns/AdvancedFilters/useFullscreenAdvancedFilters';
import type {SearchDateFilterKeys} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setCalendarPickerSelectedDateModifier} from '@libs/actions/CalendarPicker';
import {getDateModifierTitle} from '@libs/SearchQueryUtils';
import type {SearchDateValues} from '@libs/SearchQueryUtils';
import {getDatePresets} from '@libs/SearchUIUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

type DateFilterComponentProps = {
    filterKey: SearchDateFilterKeys;
    value: SearchDateValues;
    hasFeed: boolean;
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function DateFilterComponent({filterKey, value: initialValue, hasFeed, onChange}: DateFilterComponentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const fullscreen = useFullscreenAdvancedFilters();
    const dateFilterRef = useRef<DateFilterBaseHandle>(null);

    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);
    const [value, setValue] = useState(initialValue);

    // Opening the year picker blurs the Search screen and unmounts this popover, resetting selectedDateModifier
    // (the Custom date/range sub-view) back to the top menu on return. Persist it and restore it on return (a
    // pending year write-back for a search calendar) so the calendar reopens with the picked year applied.
    const [storedDateModifier] = useOnyx(ONYXKEYS.CALENDAR_PICKER_SELECTED_DATE_MODIFIER);
    const [storedYearSelection] = useOnyx(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR);
    const hasRestoredDateModifierRef = useRef(false);

    useEffect(() => {
        if (!selectedDateModifier) {
            return;
        }
        setCalendarPickerSelectedDateModifier(selectedDateModifier);
    }, [selectedDateModifier]);

    useEffect(() => {
        if (hasRestoredDateModifierRef.current || selectedDateModifier || !storedDateModifier || !storedYearSelection?.contextID.startsWith('search')) {
            return;
        }
        const dateModifierToRestore = Object.values(CONST.SEARCH.DATE_MODIFIERS).find((modifier) => modifier === storedDateModifier);
        if (!dateModifierToRestore) {
            return;
        }
        hasRestoredDateModifierRef.current = true;
        requestAnimationFrame(() => setSelectedDateModifier(dateModifierToRestore));
    }, [storedDateModifier, storedYearSelection, selectedDateModifier]);

    const getDateFormValues = (dateValues: SearchDateValues) => {
        const dateFormValues: Record<string, string | undefined> = {};
        dateFormValues[`${filterKey}On`] = dateValues[CONST.SEARCH.DATE_MODIFIERS.ON];
        dateFormValues[`${filterKey}After`] = dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        dateFormValues[`${filterKey}Before`] = dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
        dateFormValues[`${filterKey}Range`] = dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];
        return dateFormValues as Partial<SearchAdvancedFiltersForm>;
    };

    const onDateChange = (selectedDates: SearchDateValues) => {
        if (fullscreen) {
            setValue(selectedDates);
            return;
        }

        onChange(getDateFormValues(selectedDates));
    };

    return (
        <View style={[styles.flex1, !fullscreen && styles.pt2]}>
            {!!selectedDateModifier && (
                <HeaderWithBackButton
                    style={[styles.h10]}
                    subtitle={selectedDateModifier ? getDateModifierTitle(selectedDateModifier, '', translate) : ''}
                    onBackButtonPress={() => dateFilterRef.current?.goBack()}
                />
            )}
            <DateFilterBase
                ref={dateFilterRef}
                style={fullscreen ? styles.flex1 : styles.flexShrink1}
                shouldShowHeader={false}
                onDateValuesChange={(values) => {
                    if (selectedDateModifier) {
                        return;
                    }
                    onDateChange(values);
                }}
                selectedDateModifier={selectedDateModifier}
                onSelectDateModifier={setSelectedDateModifier}
                defaultDateValues={value}
                presets={getDatePresets(filterKey, hasFeed)}
                onSubmit={onDateChange}
                shouldShowActionButtons={false}
            />
            {(!!selectedDateModifier || fullscreen) && (
                <Button
                    style={[styles.ph5, styles.pb5, styles.pt3]}
                    success
                    medium={!fullscreen}
                    large={fullscreen}
                    text={translate(selectedDateModifier ? 'common.apply' : 'common.confirm')}
                    pressOnEnter
                    onPress={() => {
                        if (selectedDateModifier) {
                            dateFilterRef.current?.save();
                            return;
                        }
                        onChange(getDateFormValues(value));
                    }}
                />
            )}
        </View>
    );
}

export default DateFilterComponent;
