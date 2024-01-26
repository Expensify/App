import React from 'react';
import type {ForwardedRef} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TextSelection} from './Composer/types';
import TextInput from './TextInput';
import type {BaseTextInputRef} from './TextInput/BaseTextInput/types';

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
    onSelectionChange?: () => void;

    /** Style for the input */
    style?: StyleProp<TextStyle>;

    /** Style for the container */
    touchableInputWrapperStyle?: StyleProp<ViewStyle>;

    /** Function to call to handle key presses in the text input */
    onKeyPress?: () => void;
};

function AmountTextInput(
    {formattedAmount, onChangeAmount, placeholder, selection, onSelectionChange, style, touchableInputWrapperStyle, onKeyPress}: AmountTextInputProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    return (
        <TextInput
            disableKeyboard
            autoGrow
            hideFocusedState
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
            onKeyPress={onKeyPress}
            touchableInputWrapperStyle={touchableInputWrapperStyle}
        />
    );
}

AmountTextInput.displayName = 'AmountTextInput';

export default React.forwardRef(AmountTextInput);
