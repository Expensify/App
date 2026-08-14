import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type NumberFormNegativeMode = 'none' | 'external' | 'inValue';
type NumberFormInputPosition = 'prefix' | 'suffix';

type NumberFormRef = {
    clearSelection: () => void;
    updateNumber: (newNumber: string) => void;
    getNumber: () => string;
};

type NumberFormInputKeyPressEvent = {
    nativeEvent: {
        key: string;
        ctrlKey?: boolean;
    };
};

type NumberFormInputCommonProps = {
    /** Symbol displayed next to the number. */
    symbol?: string;

    /** Position of the symbol relative to the number. */
    position?: NumberFormInputPosition;

    /** Number of decimal places accepted by the input. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the input. */
    maxLength?: number;

    /** Whether the symbol should be hidden. */
    hideSymbol?: boolean;

    /** Whether the symbol can be pressed. Prefer NumberForm.CurrencyButton for new compositions. */
    isSymbolPressable?: boolean;

    /** Called when the inline symbol is pressed. Prefer NumberForm.CurrencyButton for new compositions. */
    onSymbolButtonPress?: () => void;

    /** Whether the value is negative when the sign is managed outside the value. */
    isNegative?: boolean;

    /** Toggle the external negative state. */
    toggleNegative?: () => void;

    /** Clear the external negative state when backspace is pressed on an empty value. */
    clearNegative?: () => void;

    /** Style applied to the number input. */
    style?: StyleProp<TextStyle>;

    /** Style applied to the input container. */
    containerStyle?: StyleProp<ViewStyle>;

    /** Style applied to the symbol. */
    symbolTextStyle?: StyleProp<TextStyle>;

    /** Style applied to the negative symbol. */
    negativeSymbolStyle?: StyleProp<TextStyle>;

    /** Reference to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;
} & {
    /** Callback for keyboard events received by the numeric input. */
    onKeyPress?: (event: NumberFormInputKeyPressEvent) => void;
} & Omit<
        Pick<
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
            | 'inputMode'
            | 'keyboardType'
            | 'label'
            | 'onBlur'
            | 'onFocus'
            | 'onPress'
            | 'prefixCharacter'
            | 'prefixContainerStyle'
            | 'prefixStyle'
            | 'shouldAllowFocusInLandscapeMode'
            | 'shouldApplyPaddingToContainer'
            | 'shouldUseDefaultLineHeightForPrefix'
            | 'submitBehavior'
            | 'suffixStyle'
            | 'testID'
            | 'touchableInputWrapperStyle'
        >,
        'onKeyPress'
    >;

/**
 * TODO: Decide whether keyboard submit handling should be supported by both input paths.
 * The current discriminated union preserves NumberWithSymbolForm's legacy behavior by allowing onSubmitEditing only for the standard TextInput path.
 */
type NumberFormInputProps = NumberFormInputCommonProps &
    (
        | {
              /** The standard input supports keyboard submit handling. */
              displayAsTextInput: true;
              onSubmitEditing?: BaseTextInputProps['onSubmitEditing'];
          }
        | {
              /** The symbol-input path preserves the legacy behavior and does not handle keyboard submit events. */
              displayAsTextInput?: false;
              onSubmitEditing?: never;
          }
    );

type NumberFormProps = {
    /** The canonical number value shared by composed primitives. */
    value?: string;

    /** Called when a composed primitive changes the canonical value. */
    onInputChange?: (value: string) => void;

    /** Describes whether the negative sign is stored in the value or managed externally. */
    negativeMode?: NumberFormNegativeMode;

    /** Error supplied by FormProvider. */
    errorText?: string;

    /** Form callback supplied by InputWrapper. */
    onBlur?: BaseTextInputProps['onBlur'];

    /** Submit callback supplied by InputWrapper. */
    onSubmitEditing?: BaseTextInputProps['onSubmitEditing'];

    /** Reference to the underlying text input, supplied by InputWrapper. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Reference exposing the number editing imperative API. */
    numberFormRef?: ForwardedRef<NumberFormRef>;

    children: ReactNode;
};

export type {NumberFormInputKeyPressEvent, NumberFormInputPosition, NumberFormInputProps, NumberFormNegativeMode, NumberFormProps, NumberFormRef};
