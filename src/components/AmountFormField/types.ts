import type {AmountEditingKeyPressEvent, AmountEditingRef} from '@components/AmountEditingController/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

type AmountFormFieldRef = AmountEditingRef;

type AmountFormFieldInputProps = {
    /** Style applied to the amount input. */
    style?: StyleProp<TextStyle>;

    /** Reference to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Callback for keyboard events received by the amount input. */
    onKeyPress?: (event: AmountEditingKeyPressEvent) => void;

    /**
     * Trailing accessories (e.g. `SignFlipButton`, `CurrencyPickerButton`) rendered inside the input border, always after the value.
     * The accessories are hidden while the underlying text input shows its clear button or loading indicator,
     * so exposing those props on this primitive would make the children disappear.
     */
    children?: ReactNode;
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
