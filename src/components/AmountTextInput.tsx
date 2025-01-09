import React from 'react';
import type {ForwardedRef} from 'react';
import type {NativeSyntheticEvent, StyleProp, TextInputKeyPressEventData, TextInputSelectionChangeEventData, TextStyle, ViewStyle} from 'react-native';
import CONST from '@src/CONST';
import type {TextSelection} from './Composer/types';
import TextInput from './TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from './TextInput/BaseTextInput/types';

type AmountTextInputProps = {
    /** Formatted amount in local currency  */
    formattedAmount: string;

    /** Function to call when amount in text input is changed */
    onChangeAmount: (amount: string) => void;

    /** Placeholder value for amount text input */
    placeholder: string;

    /** Selection Object */
    selection?: TextSelection;

    /** Function to call when selection in text input is changed */
    onSelectionChange?: (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;

    /** Style for the input */
    style?: StyleProp<TextStyle>;

    /** Style for the container */
    touchableInputWrapperStyle?: StyleProp<ViewStyle>;

    /** Whether to disable keyboard */
    disableKeyboard?: boolean;

    /** Function to call to handle key presses in the text input */
    onKeyPress?: (event: NativeSyntheticEvent<KeyboardEvent>) => void;

    /** Style for the TextInput container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Hide the focus styles on TextInput */
    hideFocusedState?: boolean;
} & Pick<BaseTextInputProps, 'autoFocus' | 'autoGrowExtraSpace'>;

function AmountTextInput(
    {
        formattedAmount,
        onChangeAmount,
        placeholder,
        selection,
        onSelectionChange,
        style,
        touchableInputWrapperStyle,
        onKeyPress,
        containerStyle,
        disableKeyboard = true,
        hideFocusedState = true,
        ...rest
    }: AmountTextInputProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    return (
        <TextInput
            autoGrow
            hideFocusedState={hideFocusedState}
            shouldInterceptSwipe
            disableKeyboard={disableKeyboard}
            inputStyle={style}
            textInputContainerStyles={containerStyle}
            onChangeText={onChangeAmount}
            ref={ref}
            value={formattedAmount}
            placeholder={placeholder}
            inputMode={CONST.INPUT_MODE.DECIMAL}
            // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
            // See https://github.com/Expensify/App/issues/51868 for more information
            autoCapitalize="words"
            blurOnSubmit={false}
            selection={selection}
            onSelectionChange={onSelectionChange}
            role={CONST.ROLE.PRESENTATION}
            onKeyPress={onKeyPress as (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => void}
            touchableInputWrapperStyle={touchableInputWrapperStyle}
            // On iPad, even if the soft keyboard is hidden, the keyboard suggestion is still shown.
            // Setting both autoCorrect and spellCheck to false will hide the suggestion.
            autoCorrect={false}
            spellCheck={false}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

AmountTextInput.displayName = 'AmountTextInput';

export default React.forwardRef(AmountTextInput);
