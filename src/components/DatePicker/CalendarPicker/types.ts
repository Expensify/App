import type {ListItem} from '@components/SelectionList/types';

type CalendarPickerListItem = ListItem & {
    /** The value representing a year in the CalendarPicker */
    value: number;
};

export default CalendarPickerListItem;
