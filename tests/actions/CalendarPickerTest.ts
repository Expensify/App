import {clearCalendarPickerSelectedYear, setCalendarPickerSelectedYear} from '@src/libs/actions/CalendarPicker';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('actions/CalendarPicker', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it('setCalendarPickerSelectedYear stores the selected year with its context in Onyx', async () => {
        setCalendarPickerSelectedYear('datePicker-dob', 1995);
        await waitForBatchedUpdates();

        const result = await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR);

        // The selection is lifted to Onyx so it survives the year picker screen navigation,
        // and is tagged with the contextID of the CalendarPicker that opened it.
        expect(result).toEqual({contextID: 'datePicker-dob', year: 1995});
    });

    it('clearCalendarPickerSelectedYear removes the stored selection once it has been consumed', async () => {
        setCalendarPickerSelectedYear('scheduleCall', 2031);
        await waitForBatchedUpdates();
        expect(await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR)).toEqual({contextID: 'scheduleCall', year: 2031});

        clearCalendarPickerSelectedYear();
        await waitForBatchedUpdates();

        expect(await getOnyxValue(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR)).toBeUndefined();
    });
});
