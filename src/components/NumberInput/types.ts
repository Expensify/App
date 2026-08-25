import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

type NumberInputPosition = 'prefix' | 'suffix';

type NumberInputRef = {
    clearSelection: () => void;
    updateNumber: (newNumber: string) => void;
    getNumber: () => string;
};

type NumberInputKeyPressEvent = {
    nativeEvent: {
        key: string;
        ctrlKey?: boolean;
    };
};

type NumberInputSelection = {
    start: number;
    end: number;
};

type NumberInputBaseProps = {
    /** Symbol displayed next to the number. */
    symbol?: string;

    /** Position of the symbol relative to the number. */
    position?: NumberInputPosition;

    /** Whether the symbol should be hidden. */
    hideSymbol?: boolean;

    /** Style applied to the number input. */
    style?: StyleProp<TextStyle>;

    /** Reference to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Callback for keyboard events received by the numeric input. */
    onKeyPress?: (event: NumberInputKeyPressEvent) => void;
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

export type {NumberInputBaseProps, NumberInputKeyPressEvent, NumberInputRef, NumberInputSelection};
