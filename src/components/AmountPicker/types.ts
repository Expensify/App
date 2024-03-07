import type {AmountFormProps} from '@components/AmountForm';
import type {MenuItemBaseProps} from '@components/MenuItem';
import type {ListItem} from '@components/SelectionList/types';
import type {MaybePhraseKey} from '@libs/Localize';

type AmountPickerListItem = ListItem & {
    value?: string;
};

type AmountPickerItem = {
    label?: string;
    value?: string;
    description?: string;
};

type AmountSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Current value */
    value?: string;

    /** Function to call when the user selects a item */
    onValueSelected?: (value: string) => void;

    /** Function to call when the user closes the modal */
    onClose?: () => void;
} & Pick<MenuItemBaseProps, 'description'> &
    AmountFormProps;

type AmountPickerProps = {
    /** Item to display */
    value?: string;

    /** A placeholder value to display */
    placeholder?: string;

    /** Form Error description */
    errorText?: MaybePhraseKey;

    /** Callback to call when the input changes */
    onInputChange?: (value: string | undefined) => void;

    /** Text to display under the main menu item */
    furtherDetails?: string;

    /** Whether to show the toolip text */
    shouldShowTooltips?: boolean;
} & Pick<MenuItemBaseProps, 'rightLabel' | 'description'> &
    AmountFormProps;

export type {AmountPickerItem, AmountSelectorModalProps, AmountPickerProps, AmountPickerListItem};
