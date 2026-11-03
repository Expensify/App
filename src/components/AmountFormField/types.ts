import type {AmountEditingKeyPressEvent, AmountEditingRef} from '@components/AmountEditingController/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

type AmountFormFieldRef = AmountEditingRef;

type AmountFormFieldInputProps = {
    /** Style applied to the amount input. */
    style?: StyleProp<TextStyle>;

    /** Reference to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Callback for keyboard events received by the amount input. */
    onKeyPress?: (event: AmountEditingKeyPressEvent) => void;
} & Pick<
    BaseTextInputProps,
    | 'accessibilityLabel'
    | 'autoFocus'
    | 'contentWidth'
    | 'disabled'
    | 'disableKeyboard'
    | 'keyboardType'
    | 'label'
    | 'onBlur'
    | 'onFocus'
    | 'onSubmitEditing'
    | 'prefixCharacter'
    | 'prefixContainerStyle'
    | 'shouldApplyPaddingToContainer'
    | 'shouldUseDefaultLineHeightForPrefix'
    | 'testID'
    | 'touchableInputWrapperStyle'
>;

export type {AmountFormFieldRef, AmountFormFieldInputProps};
