import type {ForwardedRef} from 'react';
import type {View} from 'react-native';
import type {MenuItemBaseProps} from '@components/MenuItem';
import type {NumberWithSymbolFormProps} from '@components/NumberWithSymbolForm';

type AmountSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Current value */
    value?: string;

    /** Function to call when the user selects a item */
    onValueSelected?: (value: string) => void;

    /** Function to call when the user closes the modal */
    onClose: () => void;
} & Pick<MenuItemBaseProps, 'description'> &
    Pick<
        NumberWithSymbolFormProps,
        | 'decimals'
        | 'maxLength'
        | 'symbol'
        | 'currency'
        | 'symbolPosition'
        | 'isSymbolPressable'
        | 'style'
        | 'containerStyle'
        | 'touchableInputWrapperStyle'
        | 'autoGrowExtraSpace'
        | 'autoGrowMarginSide'
    >;

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

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
} & Pick<MenuItemBaseProps, 'rightLabel' | 'description'> &
    Pick<
        NumberWithSymbolFormProps,
        'decimals' | 'maxLength' | 'symbol' | 'symbolPosition' | 'isSymbolPressable' | 'style' | 'containerStyle' | 'touchableInputWrapperStyle' | 'autoGrowExtraSpace' | 'autoGrowMarginSide'
    >;

export type {AmountSelectorModalProps, AmountPickerProps};
