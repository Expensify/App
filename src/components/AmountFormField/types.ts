import type {AmountEditingKeyPressEvent, AmountEditingRef} from '@components/AmountEditingController/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type AmountFormFieldRef = AmountEditingRef;

type AmountFormFieldInputProps = {
    /** Style applied to the amount input. */
    style?: StyleProp<TextStyle>;

    /** Reference to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Callback for keyboard events received by the amount input. */
    onKeyPress?: (event: AmountEditingKeyPressEvent) => void;

    /** Style applied to the text input container. */
    containerStyle?: StyleProp<ViewStyle>;
} & Pick<
    BaseTextInputProps,
    | 'accessibilityLabel'
    | 'autoCorrect'
    | 'autoFocus'
    | 'autoGrow'
    | 'autoGrowExtraSpace'
    | 'autoGrowMarginSide'
    | 'containerStyles'
    | 'contentWidth'
    | 'disabled'
    | 'disableKeyboard'
    | 'hideFocusedState'
    | 'keyboardType'
    | 'label'
    | 'onBlur'
    | 'onFocus'
    | 'onSubmitEditing'
    | 'placeholder'
    | 'prefixCharacter'
    | 'prefixContainerStyle'
    | 'prefixStyle'
    | 'rightHandSideComponent'
    | 'shouldApplyPaddingToContainer'
    | 'shouldUseDefaultLineHeightForPrefix'
    | 'shouldUseFullInputHeight'
    | 'spellCheck'
    | 'submitBehavior'
    | 'testID'
    | 'touchableInputWrapperStyle'
>;

export type {AmountFormFieldRef, AmountFormFieldInputProps};
