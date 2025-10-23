import type {ListItem} from '@components/SelectionListWithSections/types';

type CalendarPickerListItem = ListItem & {
    /** The value representing a year in the CalendarPicker */
    value: number;
};

export default CalendarPickerListItem;
