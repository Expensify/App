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

export {setCalendarPickerSelectedYear, clearCalendarPickerSelectedYear};
