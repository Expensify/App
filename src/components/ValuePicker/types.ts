import type {ListItem} from '@components/SelectionList/types';
import type {MaybePhraseKey} from '@libs/Localize';

type ValuePickerListItem = ListItem & {
    value?: string;
};

type ValuePickerItem = {
    label?: string;
    value?: string;
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
    onItemSelected?: (item: ValuePickerListItem) => void;

    /** Function to call when the user closes the modal */
    onClose?: () => void;

    /** Whether to show the tooltip text */
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
    errorText?: MaybePhraseKey;

    /** Callback to call when the input changes */
    onInputChange?: (value: string | undefined) => void;

    /** Text to display under the main menu item */
    furtherDetails?: string;

    /** Whether to show the tooltip text */
    shouldShowTooltips?: boolean;
};

export type {ValuePickerItem, ValueSelectorModalProps, ValuePickerProps, ValuePickerListItem};
