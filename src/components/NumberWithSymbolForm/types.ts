import type {NumericTextInputProps} from '@components/NumericInput/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import type {TextInputWithSymbolProps} from '@components/TextInputWithSymbol/types';

import type CONST from '@src/CONST';

import type {ForwardedRef, ReactNode} from 'react';
import type {KeyboardTypeOptions, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

type NumberWithSymbolFormProps = {
    /** Value to display, should already be formatted */
    value?: string;

    /** Callback to update the value in the FormProvider */
    onInputChange?: (number: string) => void;

    decimals?: number;

    /** Currency of the input */
    currency?: string;

    shouldShowBigNumberPad?: boolean;

    /** Footer to display at the bottom of the form */
    footer?: ReactNode;

    numberFormRef?: ForwardedRef<NumberWithSymbolFormRef>;

    /** Error to display at the bottom of the form */
    errorText?: string;

    /** Whether the form should use a standard TextInput as a base */
    displayAsTextInput?: boolean;

    /** Custom label for the TextInput */
    label?: string;

    shouldWrapInputInContainer?: boolean;
    scrollViewStyle?: StyleProp<ViewStyle>;

    /** Whether to refocus the input when clicking on the ScrollView empty space */
    shouldRefocusOnScrollViewClick?: boolean;

    /** Whether the amount is negative */
    isNegative?: boolean;

    /** Function to toggle the amount to negative */
    toggleNegative?: () => void;

    /** Function to clear the negative amount */
    clearNegative?: () => void;

    /** Whether to allow flipping amount (shows flip button and enables toggle mechanism) */
    allowFlippingAmount?: boolean;

    /** Whether to allow direct negative input (for split amounts where value is already negative) */
    allowNegativeInput?: boolean;

    negativeSymbolStyle?: StyleProp<TextStyle>;

    /** Whether to use dynamic font size for the amount input */
    shouldUseDynamicFontSize?: boolean;

    /** Whether the input is disabled or not */
    disabled?: boolean;

    ref?: ForwardedRef<BaseTextInputRef>;
    onSubmitEditing?: () => void;
    keyboardType?: KeyboardTypeOptions;
    shouldShowFlipButton?: boolean;

    /** Whether to show the currency selection button */
    shouldShowCurrencyButton?: boolean;

    /** Extra content rendered at the start of the right-hand side, before the flip and currency buttons. `displayAsTextInput` mode only. */
    leadingRightHandSideComponent?: ReactNode;

    onCurrencyButtonPress?: () => void;

    /**
     * Label on the trailing dropdown button (e.g. currency code). When set, used instead of `currency` so the same control can show a unit or other suffix.
     */
    currencyButtonLabel?: string;

    /** Accessibility label for the trailing dropdown button (defaults to currency-based copy when unset) */
    currencyButtonAccessibilityLabel?: string;

    /**
     * Renders the flip and currency buttons as their icon plus label, without the pill background, so they read as
     * part of the field rather than as controls stacked on top of it. Their tap targets are unchanged.
     * Left off for `AmountForm`, whose trailing button (e.g. the Chronos OOO duration unit) is a control on top of a
     * standalone amount input rather than a row inside a form, so it keeps the pill. `displayAsTextInput` mode only.
     */
    shouldUseBorderlessButtons?: boolean;
} & Omit<TextInputWithSymbolProps, 'formattedAmount' | 'onAmountChange' | 'placeholder' | 'onSelectionChange' | 'onKeyPress' | 'onMouseDown' | 'onMouseUp'>;

type NumberWithSymbolFormRef = {
    clearSelection: () => void;
    updateNumber: (newNumber: string) => void;
    getNumber: () => string;
};

/** Props shared by the NumericInput and NumericField roots the adapter renders. */
type AdapterRootProps = {
    /** Value handed to the root */
    value: string;

    /** Receives every value the root reports */
    onInputChange?: (value: string) => void;

    /** Whether the root accepts a negative value */
    allowNegative: boolean;

    /** Number of decimal places accepted by the root */
    decimals: number;

    /** Maximum number of integer digits accepted by the root */
    maxLength?: number;

    /** Error rendered by the root */
    errorText?: string;
};

/** Text input props the adapter forwards unchanged to the inline and full-screen paths. */
type AdapterTextInputProps = Pick<
    NumericTextInputProps,
    | 'accessibilityLabel'
    | 'autoFocus'
    | 'autoGrow'
    | 'autoGrowExtraSpace'
    | 'autoGrowMarginSide'
    | 'containerStyle'
    | 'contentWidth'
    | 'disabled'
    | 'disableKeyboard'
    | 'hideFocusedState'
    | 'keyboardType'
    | 'onBlur'
    | 'onFocus'
    | 'onSubmitEditing'
    | 'prefixCharacter'
    | 'prefixContainerStyle'
    | 'prefixStyle'
    | 'ref'
    | 'shouldApplyPaddingToContainer'
    | 'shouldUseDefaultLineHeightForPrefix'
    | 'style'
    | 'submitBehavior'
    | 'testID'
    | 'touchableInputWrapperStyle'
>;

type SymbolPosition = ValueOf<typeof CONST.TEXT_INPUT_SYMBOL_POSITION>;

export type {AdapterRootProps, AdapterTextInputProps, NumberWithSymbolFormProps, NumberWithSymbolFormRef, SymbolPosition};
