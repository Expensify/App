import type {NumericFlipButtonProps as BaseNumericFlipButtonProps} from '@components/NumericButtons';
import type {NumericEditingKeyPressEvent, NumericEditingRef} from '@components/NumericEditingController/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type NumericInputProps = {
    /** Canonical value shared by composed primitives. Only an empty value resets editing state. */
    value?: string;

    /** Called with the canonical signed value when a composed primitive changes it. */
    onInputChange?: (value: string) => void;

    /** Whether negative values are allowed. The canonical value always stores its sign. */
    allowNegative?: boolean;

    /** Number of decimal places accepted by the composer. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the composer. */
    maxLength?: number;

    /** Error message placed by the layout under the amount. */
    errorText?: string;

    /** Ref exposing the number editing imperative API. */
    ref?: ForwardedRef<NumericEditingRef>;

    /**
     * The amount row: `NumericInput.TextInput` and `NumericInput.Symbol`, in display order. The minus sign of a negative value
     * is rendered before it.
     */
    children: ReactNode;

    /**
     * Actions under the amount, such as `NumericInput.CurrencyButton` and `NumericInput.FlipButton`. They form a row below the
     * amount on touch screens and sit right under it elsewhere.
     */
    actions?: ReactNode;

    /** Content below the amount and the number pad, typically the submit button. */
    footer?: ReactNode;

    /** Test identifier of the layout root. Its parts get the `-body`, `-main`, `-amount`, `-pad` and `-footer` suffixes. */
    testID?: string;

    /** Whether to dynamically scale the font size down when the amount is long. */
    shouldUseDynamicFontSize?: boolean;
};

type NumericTextInputProps = {
    /** Style applied to the number input. */
    style?: StyleProp<TextStyle>;

    /** Reference to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Callback for keyboard events received by the numeric input. */
    onKeyPress?: (event: NumericEditingKeyPressEvent) => void;

    /** Style applied to the input container. */
    containerStyle?: StyleProp<ViewStyle>;
} & Pick<
    BaseTextInputProps,
    | 'accessibilityLabel'
    | 'autoFocus'
    | 'autoGrow'
    | 'autoGrowExtraSpace'
    | 'autoGrowMarginSide'
    | 'disableKeyboard'
    | 'hideFocusedState'
    | 'keyboardType'
    | 'onBlur'
    | 'onFocus'
    | 'onPress'
    | 'onSubmitEditing'
    | 'prefixCharacter'
    | 'prefixContainerStyle'
    | 'prefixStyle'
    | 'shouldAllowFocusInLandscapeMode'
    | 'shouldApplyPaddingToContainer'
    | 'shouldUseDefaultLineHeightForPrefix'
    | 'testID'
    | 'touchableInputWrapperStyle'
>;

type NumericSymbolProps = {
    /** Symbol (currency or unit) rendered beside the number. Its length counts toward the dynamic font size. */
    children: string;

    /** Style applied to the symbol text, appended to the primitive's defaults. */
    textStyle?: StyleProp<TextStyle>;
};

type NumericInputFlipButtonProps = Omit<BaseNumericFlipButtonProps, 'onPress'>;

export type {NumericInputFlipButtonProps, NumericInputProps, NumericSymbolProps, NumericTextInputProps};
