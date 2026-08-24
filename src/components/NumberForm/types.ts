import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

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

type NumberFormInputBaseProps = {
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

    /** Style applied to the number input. */
    style?: StyleProp<TextStyle>;

    /** Reference to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Callback for keyboard events received by the numeric input. */
    onKeyPress?: (event: NumberFormInputKeyPressEvent) => void;
} & Pick<
    BaseTextInputProps,
    | 'accessibilityLabel'
    | 'autoFocus'
    | 'autoGrowExtraSpace'
    | 'autoGrowMarginSide'
    | 'contentWidth'
    | 'disabled'
    | 'disableKeyboard'
    | 'keyboardType'
    | 'onBlur'
    | 'onFocus'
    | 'prefixContainerStyle'
    | 'shouldApplyPaddingToContainer'
    | 'shouldUseDefaultLineHeightForPrefix'
    | 'submitBehavior'
    | 'testID'
    | 'touchableInputWrapperStyle'
>;

type NumberFormSymbolInputProps = NumberFormInputBaseProps &
    Pick<BaseTextInputProps, 'onPress' | 'shouldAllowFocusInLandscapeMode'> & {
        /** Whether the symbol can be pressed. Prefer NumberForm.CurrencyButton for new compositions. */
        isSymbolPressable?: boolean;

        /** Called when the inline symbol is pressed. Prefer NumberForm.CurrencyButton for new compositions. */
        onSymbolButtonPress?: () => void;

        /** Whether the input grows with its content. */
        autoGrow?: boolean;

        /** Hide the focused appearance of the symbol input. */
        hideFocusedState?: boolean;

        /** Style applied to the input container. */
        containerStyle?: StyleProp<ViewStyle>;

        /** Style applied to the symbol. */
        symbolTextStyle?: StyleProp<TextStyle>;

        /** Style applied to the negative symbol. */
        negativeSymbolStyle?: StyleProp<TextStyle>;
    };

type NumberFormTextInputProps = NumberFormInputBaseProps & Pick<BaseTextInputProps, 'inputMode' | 'label' | 'onSubmitEditing' | 'prefixStyle' | 'suffixStyle'>;

export type {NumberFormInputBaseProps, NumberFormInputKeyPressEvent, NumberFormRef, NumberFormSymbolInputProps, NumberFormTextInputProps};
