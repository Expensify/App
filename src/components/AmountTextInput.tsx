import React from 'react';
import type {ForwardedRef} from 'react';
import type {NativeSyntheticEvent, StyleProp, TextInputKeyPressEventData, TextInputSelectionChangeEventData, TextStyle, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
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

    /** Function to call to handle key presses in the text input */
    onKeyPress?: (event: NativeSyntheticEvent<KeyboardEvent>) => void;
} & Pick<BaseTextInputProps, 'autoFocus'>;

function AmountTextInput(
    {formattedAmount, onChangeAmount, placeholder, selection, onSelectionChange, style, touchableInputWrapperStyle, onKeyPress, ...rest}: AmountTextInputProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    return (
        <TextInput
            disableKeyboard
            autoGrow
            hideFocusedState
            shouldInterceptSwipe
            inputStyle={[styles.iouAmountTextInput, styles.p0, styles.noLeftBorderRadius, styles.noRightBorderRadius, style]}
            textInputContainerStyles={[styles.borderNone, styles.noLeftBorderRadius, styles.noRightBorderRadius]}
            onChangeText={onChangeAmount}
            ref={ref}
            value={formattedAmount}
            placeholder={placeholder}
            inputMode={CONST.INPUT_MODE.NUMERIC}
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
