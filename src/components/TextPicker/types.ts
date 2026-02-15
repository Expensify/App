import type {ForwardedRef} from 'react';
import type {View} from 'react-native';
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

    /** The ID used to uniquely identify the input in a Form */
    inputID: string;

    /** Whether the field is required */
    required?: boolean;

    /** Custom validation function */
    customValidate?: (values: Record<string, string>) => Record<string, string>;

    /** Whether the form should be actionable when offline */
    enabledWhenOffline?: boolean;

    /** Whether HTML is allowed in form inputs */
    allowHTML?: boolean;
} & Pick<MenuItemBaseProps, 'subtitle' | 'description'> &
    Omit<TextProps, 'ref'>;

type TextPickerProps = {
    /** Item to display */
    value?: string;

    /** A placeholder value to display */
    placeholder?: string;

    /** Form Error description */
    errorText?: string;

    /** Callback to call when the input changes */
    onInputChange?: (value: string | undefined) => void;

    /**
     * Called after the user commits the value (presses Save in the modal),
     * once the modal has closed, the parent value is updated.
     */
    onValueCommitted?: (value: string) => void;

    /** Text to display under the main menu item */
    furtherDetails?: string;

    /** Whether to show the tooltip text */
    shouldShowTooltips?: boolean;

    /** The ID used to uniquely identify the input in a Form */
    inputID: string;

    /** Whether the field is required */
    required?: boolean;

    /** Custom validation function */
    customValidate?: (values: Record<string, string>) => Record<string, string>;

    /** Whether the form should be actionable when offline */
    enabledWhenOffline?: boolean;

    /** Whether HTML is allowed in form inputs */
    allowHTML?: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
} & Pick<MenuItemBaseProps, 'rightLabel' | 'subtitle' | 'description' | 'interactive' | 'wrapperStyle' | 'numberOfLinesTitle' | 'titleStyle' | 'descriptionTextStyle'> &
    TextProps;

export type {TextSelectorModalProps, TextPickerProps};
