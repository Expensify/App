import type {RadioItem} from '@components/SelectionList/types';

type CalendarPickerRadioItem = RadioItem & {
    /** The value representing a year in the CalendarPicker */
    value: number;
};

export default CalendarPickerRadioItem;
