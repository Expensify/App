import type {AmountEditingKeyPressEvent, AmountEditingRef} from '@components/AmountEditingController/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

type AmountFormFieldRef = AmountEditingRef;

type AmountFormFieldProps = {
    /** Canonical value shared by composed primitives; only an empty value resets editing state. */
    value?: string;

    /** Called with the canonical value whenever the user commits an edit. */
    onInputChange?: (value: string) => void;

    /** Whether negative values are allowed; the canonical value always stores its sign. */
    allowNegative?: boolean;

    /** Number of decimal places accepted by the form. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the form. */
    maxLength?: number;

    /** Error message rendered by the text input. */
    errorText?: string;

    /** Ref exposing the number editing imperative API. */
    ref?: ForwardedRef<AmountFormFieldRef>;

    /** Composed primitives that consume AmountFormField state and actions through context. */
    children: ReactNode;
};

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

export type {AmountFormFieldRef, AmountFormFieldInputProps, AmountFormFieldProps};
