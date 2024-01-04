import type {ForwardedRef} from 'react';
import React from 'react';
import type {StyleProp, TextInput, TextStyle, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type TextInputSelection from '@src/types/utils/TextInputSelection';
import TextInputComponent from './TextInput';

type AmountTextInputProps = {
    /** Formatted amount in local currency  */
    formattedAmount: string;

    /** A ref to forward to amount text input */
    forwardedRef?: ForwardedRef<TextInput>;

    /** Function to call when amount in text input is changed */
    onChangeAmount: (amount: string) => void;

    /** Placeholder value for amount text input */
    placeholder: string;

    /** Selection Object */
    selection?: TextInputSelection;

    /** Function to call when selection in text input is changed */
    onSelectionChange?: () => void;

    /** Style for the input */
    style?: StyleProp<TextStyle>;

    /** Style for the container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Function to call to handle key presses in the text input */
    onKeyPress?: () => void;
};

function AmountTextInput({
    formattedAmount,
    forwardedRef = undefined,
    onChangeAmount,
    placeholder,
    selection = undefined,
    onSelectionChange = () => {},
    style = {},
    containerStyles = {},
    onKeyPress = () => {},
}: AmountTextInputProps) {
    const styles = useThemeStyles();
    return (
        <TextInputComponent
            disableKeyboard
            autoGrow
            hideFocusedState
            inputStyle={[styles.iouAmountTextInput, styles.p0, styles.noLeftBorderRadius, styles.noRightBorderRadius, style]}
            textInputContainerStyles={[styles.borderNone, styles.noLeftBorderRadius, styles.noRightBorderRadius]}
            onChangeText={onChangeAmount}
            ref={forwardedRef}
            value={formattedAmount}
            placeholder={placeholder}
            inputMode={CONST.INPUT_MODE.NUMERIC}
            blurOnSubmit={false}
            selection={selection}
            onSelectionChange={onSelectionChange}
            role={CONST.ROLE.PRESENTATION}
            onKeyPress={onKeyPress}
            containerStyles={containerStyles}
        />
    );
}

AmountTextInput.displayName = 'AmountTextInput';

export default React.forwardRef(AmountTextInput);
