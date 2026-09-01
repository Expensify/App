import type {NumericEditingKeyPressEvent, NumericEditingRef} from '@components/NumericEditingController/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

type NumericFieldRef = NumericEditingRef;

type NumericTextInputProps = {
    /** Symbol displayed next to the number. */
    symbol?: string;

    /** Whether the symbol should be hidden. */
    hideSymbol?: boolean;

    /** Style applied to the number input. */
    style?: StyleProp<TextStyle>;

    /** Reference to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Callback for keyboard events received by the numeric input. */
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
    | 'label'
    | 'onBlur'
    | 'onFocus'
    | 'onSubmitEditing'
    | 'prefixContainerStyle'
    | 'prefixStyle'
    | 'shouldApplyPaddingToContainer'
    | 'shouldUseDefaultLineHeightForPrefix'
    | 'submitBehavior'
    | 'testID'
    | 'touchableInputWrapperStyle'
>;

export type {NumericFieldRef, NumericTextInputProps};
