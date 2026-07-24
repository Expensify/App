import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * Stores the year selected in the year picker screen so the CalendarPicker instance that
 * opened it (identified by `contextID`) can read it back when it is next rendered.
 */
function setCalendarPickerSelectedYear(contextID: string, year: number) {
    Onyx.set(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR, {contextID, year});
}

/** Clears the stored year picker selection once it has been consumed by a CalendarPicker. */
function clearCalendarPickerSelectedYear() {
    Onyx.set(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR, null);
}

/**
 * Stores the active Search date-filter sub-view (e.g. a Custom date/range modifier) so the date filter
 * can restore it when the popover remounts after the year picker screen blurs and unmounts it.
 */
function setCalendarPickerSelectedDateModifier(selectedDateModifier: string) {
    Onyx.set(ONYXKEYS.CALENDAR_PICKER_SELECTED_DATE_MODIFIER, selectedDateModifier);
}

/** Clears the stored Search date-filter sub-view once it is no longer needed (the user left the sub-view rather than opening the year picker). */
function clearCalendarPickerSelectedDateModifier() {
    Onyx.set(ONYXKEYS.CALENDAR_PICKER_SELECTED_DATE_MODIFIER, null);
}

export {setCalendarPickerSelectedYear, clearCalendarPickerSelectedYear, setCalendarPickerSelectedDateModifier, clearCalendarPickerSelectedDateModifier};
