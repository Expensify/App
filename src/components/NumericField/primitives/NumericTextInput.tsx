import type {NumericEditingKeyPressEvent} from '@components/NumericEditingController';
import {useNumericFieldActions, useNumericFieldState} from '@components/NumericField/context';
import type {NumericTextInputProps} from '@components/NumericField/types';
import TextInput from '@components/TextInput';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {TextInputSelectionChangeEvent} from 'react-native';

/** Text input primitive connected to a NumericField root. */
function NumericTextInput({
    prefixCharacter = '',
    ref,
    onKeyPress,
    onBlur,
    accessibilityLabel,
    autoFocus,
    contentWidth,
    disabled,
    disableKeyboard,
    keyboardType,
    label,
    onFocus,
    prefixContainerStyle,
    shouldApplyPaddingToContainer,
    shouldUseDefaultLineHeightForPrefix,
    onSubmitEditing,
    submitBehavior = 'submit',
    testID,
    touchableInputWrapperStyle,
    style,
}: NumericTextInputProps) {
    const styles = useThemeStyles();
    const {errorText, formattedNumber, selection} = useNumericFieldState();
    const {handleKeyPress, handleSelectionChange, setNumber} = useNumericFieldActions();

    const handleInputKeyPress = (event: NumericEditingKeyPressEvent) => {
        handleKeyPress(event);
        onKeyPress?.(event);
    };

    return (
        <TextInput
            accessibilityLabel={accessibilityLabel}
            // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
            // See https://github.com/Expensify/App/issues/51868 for more information
            autoCapitalize="words"
            autoFocus={autoFocus}
            contentWidth={contentWidth}
            disabled={disabled}
            disableKeyboard={disableKeyboard}
            errorText={errorText}
            inputMode={!keyboardType ? CONST.INPUT_MODE.DECIMAL : undefined}
            inputStyle={style}
            keyboardType={keyboardType ?? CONST.KEYBOARD_TYPE.DECIMAL_PAD}
            label={label}
            onBlur={onBlur}
            onChangeText={setNumber}
            onFocus={onFocus}
            onKeyPress={handleInputKeyPress}
            onSelectionChange={(event: TextInputSelectionChangeEvent) => handleSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end)}
            onSubmitEditing={onSubmitEditing}
            prefixCharacter={prefixCharacter}
            prefixContainerStyle={prefixContainerStyle}
            prefixStyle={styles.colorMuted}
            ref={ref}
            selection={selection}
            shouldApplyPaddingToContainer={shouldApplyPaddingToContainer}
            shouldUseDefaultLineHeightForPrefix={shouldUseDefaultLineHeightForPrefix}
            submitBehavior={submitBehavior}
            testID={testID}
            touchableInputWrapperStyle={touchableInputWrapperStyle}
            value={formattedNumber}
        />
    );
}

export default NumericTextInput;
