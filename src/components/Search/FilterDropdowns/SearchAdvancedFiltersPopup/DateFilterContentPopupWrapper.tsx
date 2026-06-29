import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import DateFilterContent from '@components/Search/FilterComponents/AdvancedFilters/DateFilterContent';
import type {DateFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearCalendarPickerSelectedDateModifier, setCalendarPickerSelectedDateModifier} from '@libs/actions/CalendarPicker';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function DateFilterContentPopupWrapper({filterKey, value, hasFeed, onChange}: DateFilterContentWrapperProps) {
    const styles = useThemeStyles();
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

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

    const handleDateModifierSelected = useCallback((modifier: SearchDateModifier | null) => {
        // Leaving the sub-view (not via the year picker, which unmounts us instead) — drop the persisted breadcrumb.
        if (!modifier) {
            clearCalendarPickerSelectedDateModifier();
        }
        setSelectedDateModifier(modifier);
    }, []);

    return (
        <View style={[styles.flex1, selectedDateModifier ? styles.pt2 : styles.pv2]}>
            <DateFilterContent
                filterKey={filterKey}
                value={value}
                hasFeed={hasFeed}
                selectedDateModifier={selectedDateModifier}
                style={[styles.flexShrink1]}
                onDateModifierSelected={handleDateModifierSelected}
                onChange={onChange}
            />
        </View>
    );
}

export default DateFilterContentPopupWrapper;
