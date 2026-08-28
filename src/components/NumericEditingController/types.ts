import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

type NumericEditingPosition = 'prefix' | 'suffix';

type NumericEditingRef = {
    clearSelection: () => void;
    updateNumber: (newNumber: string) => void;
    getNumber: () => string;
};

type NumericEditingKeyPressEvent = {
    nativeEvent: {
        key: string;
        ctrlKey?: boolean;
    };
};

type NumericEditingSelection = {
    start: number;
    end: number;
};

type NumericEditingBaseProps = {
    symbol?: string;

    position?: NumericEditingPosition;

    hideSymbol?: boolean;

    style?: StyleProp<TextStyle>;

    ref?: ForwardedRef<BaseTextInputRef>;

    onKeyPress?: (event: NumericEditingKeyPressEvent) => void;
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

export type {NumericEditingBaseProps, NumericEditingKeyPressEvent, NumericEditingRef, NumericEditingSelection};
