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

    /** Whether the input grows with its content. */
    autoGrow?: boolean;

    /** Hide the focused appearance of the input. */
    hideFocusedState?: boolean;

    /** Style applied to the input container. */
    containerStyle?: StyleProp<ViewStyle>;
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
    | 'onPress'
    | 'prefixCharacter'
    | 'prefixContainerStyle'
    | 'prefixStyle'
    | 'shouldApplyPaddingToContainer'
    | 'shouldUseDefaultLineHeightForPrefix'
    | 'submitBehavior'
    | 'testID'
    | 'touchableInputWrapperStyle'
>;

type NumericSymbolProps = {
    /** Symbol (currency or unit) rendered beside the number. The composition decides whether to render it at all. */
    children: ReactNode;

    /** Whether the symbol can be pressed. Prefer a dedicated currency control for new compositions. */
    isSymbolPressable?: boolean;

    /** Called when the symbol is pressed. Prefer a dedicated currency control for new compositions. */
    onSymbolButtonPress?: () => void;

    /** Style applied to the symbol text, appended to the primitive's defaults. */
    textStyle?: StyleProp<TextStyle>;
};

export type {NumericInputContainerProps, NumericSymbolProps, NumericTextInputProps};
