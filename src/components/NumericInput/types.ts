import type {NumericEditingKeyPressEvent} from '@components/NumericEditingController/types';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type NumericInputContainerProps = {
    /** Composed numeric primitives rendered inside the centered amount layout. */
    children: ReactNode;

    /** Additional styles applied to the outer container. */
    style?: StyleProp<ViewStyle>;

    /** Test identifier applied to the interactive number view. */
    testID?: string;
};

type NumericTextInputProps = {
    /** Style applied to the number input. */
    style?: StyleProp<TextStyle>;

    /** Reference to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Callback for keyboard events received by the numeric input. */
    onKeyPress?: (event: NumericEditingKeyPressEvent) => void;

    /** Style applied to the input container. */
    containerStyle?: StyleProp<ViewStyle>;
} & Pick<
    BaseTextInputProps,
    | 'accessibilityLabel'
    | 'autoFocus'
    | 'autoGrow'
    | 'autoGrowExtraSpace'
    | 'autoGrowMarginSide'
    | 'disabled'
    | 'disableKeyboard'
    | 'hideFocusedState'
    | 'keyboardType'
    | 'onBlur'
    | 'onFocus'
    | 'onPress'
    | 'onSubmitEditing'
    | 'prefixCharacter'
    | 'prefixContainerStyle'
    | 'prefixStyle'
    | 'shouldAllowFocusInLandscapeMode'
    | 'shouldApplyPaddingToContainer'
    | 'shouldUseDefaultLineHeightForPrefix'
    | 'testID'
    | 'touchableInputWrapperStyle'
>;

type NumericSymbolProps = {
    /** Symbol (currency or unit) rendered beside the number. */
    children: ReactNode;

    /** Style applied to the symbol text, appended to the primitive's defaults. */
    textStyle?: StyleProp<TextStyle>;
};

type NumericSymbolButtonProps = {
    /** Symbol (currency or unit) rendered inside the button. */
    children: ReactNode;

    /** Called when the symbol button is pressed. */
    onPress: () => void;

    /** Style applied to the symbol text, appended to the primitive's defaults. */
    textStyle?: StyleProp<TextStyle>;
};

type NumericMinusSignProps = {
    /** Style applied to the minus sign, appended to the primitive's defaults. */
    style?: StyleProp<TextStyle>;
};

type NumericErrorProps = {
    /** Style applied to the message container, appended to the primitive's defaults. */
    style?: StyleProp<ViewStyle>;
};

type NumericBigNumberPadProps = {
    /** Style applied to the pad container */
    style?: StyleProp<ViewStyle>;

    /** Called when the user starts or stops long pressing the "<" (backspace) button */
    longPressHandlerStateChanged?: (isUserLongPressingBackspace: boolean) => void;

    /** Optional callback when a number or backspace is pressed */
    numberPressed?: (key: string) => void;

    /** Test identifier for the pad */
    testID?: string;
};

export type {NumericBigNumberPadProps, NumericErrorProps, NumericInputContainerProps, NumericMinusSignProps, NumericSymbolButtonProps, NumericSymbolProps, NumericTextInputProps};
