import type {MenuItemBaseProps} from '@components/MenuItem';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

type TextProps = Exclude<BaseTextInputProps, 'value' | 'onInputChange'>;

type TextSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Current value */
    value?: string;

    /** Function to call when the user selects a item */
    onValueSelected?: (value: string) => void;

    /** Function to call when the user closes the modal */
    onClose: () => void;

    /** Whether to show the tooltip text */
    shouldShowTooltips?: boolean;

    /** Whether to clear the input value when the modal closes */
    shouldClearOnClose?: boolean;
} & Pick<MenuItemBaseProps, 'subtitle' | 'description'> &
    TextProps;

type TextPickerProps = {
    /** Item to display */
    value?: string;

    /** A placeholder value to display */
    placeholder?: string;

    /** Form Error description */
    errorText?: string;

    /** Callback to call when the input changes */
    onInputChange?: (value: string | undefined) => void;

    /** Text to display under the main menu item */
    furtherDetails?: string;

    /** Whether to show the tooltip text */
    shouldShowTooltips?: boolean;
} & Pick<MenuItemBaseProps, 'rightLabel' | 'subtitle' | 'description'> &
    TextProps;

export type {TextSelectorModalProps, TextPickerProps};
