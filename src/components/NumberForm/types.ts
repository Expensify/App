import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

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

type NumberFormTextInputProps = NumberFormInputBaseProps & Pick<BaseTextInputProps, 'inputMode' | 'label' | 'onSubmitEditing' | 'prefixStyle' | 'suffixStyle'>;

export type {NumberFormInputBaseProps, NumberFormInputKeyPressEvent, NumberFormRef, NumberFormTextInputProps};
