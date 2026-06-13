import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

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

export {setCalendarPickerSelectedYear, clearCalendarPickerSelectedYear, setCalendarPickerSelectedDateModifier};
