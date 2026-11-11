import type {ListItem} from '@components/SelectionList/types';

type CalendarPickerListItem = ListItem & {
    /** The year, or the 0-indexed month, that the row represents in the CalendarPicker */
    value: number;
};

export default CalendarPickerListItem;
