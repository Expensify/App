import type {RadioItem} from '@components/SelectionList/types';

type ValuePickerItem = RadioItem & {
    value?: string;
    label?: string;
    description?: string;
};

type ValueSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Items to pick from */
    items?: ValuePickerItem[];

    /** The selected item */
    selectedItem?: ValuePickerItem;

    /** Label for values */
    label?: string;

    /** Function to call when the user selects a item */
    onItemSelected: (item: ValuePickerItem) => void;

    /** Function to call when the user closes the modal */
    onClose: () => void;

    /** Whether to show the toolip text */
    shouldShowTooltips?: boolean;
};

type ValuePickerProps = {
    /** Item to display */
    value?: string;

    /** Label of picker */
    label?: string;

    /** Items to pick from */
    items?: ValuePickerItem[];

    /** A placeholder value to display */
    placeholder?: string;

    /** Form Error description */
    errorText?: string;

    /** Callback to call when the input changes */
    onInputChange?: (value: string) => void;

    /** Text to display under the main menu item */
    furtherDetails?: string;

    /** Whether to show the toolip text */
    shouldShowTooltips?: boolean;
};

export type {ValuePickerItem, ValueSelectorModalProps, ValuePickerProps};
