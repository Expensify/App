import type {MenuItemBaseProps} from '@components/MenuItem';
import type {BaseSelectionListProps, ListItem} from '@components/SelectionList/types';

type SelectionListSelectorModalProps<TItem extends ListItem> = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Current value */
    value?: TItem;

    /** Function to call when the user selects a item */
    onValueSelected?: (value: TItem) => void;

    /** Function to call when the user closes the modal */
    onClose: () => void;
} & Pick<MenuItemBaseProps, 'description'> &
    BaseSelectionListProps<TItem>;

type SelectionListPickerProps<TItem extends ListItem> = {
    /** Item to display */
    value?: TItem;

    /** A placeholder value to display */
    title?: string | ((value?: string) => string);

    /** Form Error description */
    errorText?: string;

    /** Callback to call when the input changes */
    onInputChange?: (value: string | undefined) => void;

    /** Text to display under the main menu item */
    furtherDetails?: string;

    /** Whether to show the tooltip text */
    shouldShowTooltips?: boolean;
} & Pick<MenuItemBaseProps, 'rightLabel' | 'description'>;

export type {SelectionListSelectorModalProps, SelectionListPickerProps};
