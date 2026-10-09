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

    /** Error supplied by FormProvider, placed by the layout under the amount. */
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

    /**
     * Content below the amount and the number pad, typically the submit button. Omit it when the screen renders its own submit
     * button below the input, as FormProvider does.
     */
    footer?: ReactNode;

    /** Test identifier of the layout root. Its parts get the `-body`, `-main`, `-amount`, `-pad` and `-footer` suffixes. */
    testID?: string;

    /** Whether to dynamically scale the font size down when the amount is long. */
    shouldUseDynamicFontSize?: boolean;

    /**
     * Symbol counted in the total display length when dynamic font sizing is enabled. Only this prop's length is counted, not
     * the children of `NumericInput.Symbol`, so it must match the text the composition renders there.
     */
    symbol?: string;
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

    /** Whether to dynamically scale the font size down when the amount is long. */
    shouldUseDynamicFontSize?: boolean;
} & Pick<
    BaseTextInputProps,
    | 'accessibilityLabel'
    | 'autoFocus'
    | 'autoGrow'
    | 'autoGrowExtraSpace'
    | 'autoGrowMarginSide'
    | 'contentWidth'
    | 'disabled'
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
    | 'submitBehavior'
    | 'testID'
    | 'touchableInputWrapperStyle'
>;

type NumericSymbolProps = {
    /** Symbol (currency or unit) rendered beside the number. */
    children: ReactNode;

    /** Style applied to the symbol text, appended to the primitive's defaults. */
    textStyle?: StyleProp<TextStyle>;
};

type NumericInputFlipButtonProps = Omit<BaseNumericFlipButtonProps, 'onPress'>;

export type {NumericInputFlipButtonProps, NumericInputProps, NumericSymbolProps, NumericTextInputProps};
