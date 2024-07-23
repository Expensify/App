import type {AmountFormProps} from '@components/AmountForm';
import type {MenuItemBaseProps} from '@components/MenuItem';

type AmountSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Current value */
    value?: string;

    /** Function to call when the user selects a item */
    onValueSelected?: (value: string) => void;

    /** Function to call when the user closes the modal */
    onClose: () => void;
} & Pick<MenuItemBaseProps, 'description'>;

type AmountPickerProps = {
    /** Item to display */
    value?: string;

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
} & Pick<MenuItemBaseProps, 'rightLabel' | 'description'> &
    AmountFormProps;

export type {AmountSelectorModalProps, AmountPickerProps};
