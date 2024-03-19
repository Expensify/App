import type {MenuItemBaseProps} from '@components/MenuItem';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';
import type {MaybePhraseKey} from '@libs/Localize';

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
} & Pick<MenuItemBaseProps, 'description'> &
    TextProps;

type TextPickerProps = {
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

    /** Whether to show the tooltip text */
    shouldShowTooltips?: boolean;
} & Pick<MenuItemBaseProps, 'rightLabel' | 'description'> &
    TextProps;

export type {TextSelectorModalProps, TextPickerProps};
