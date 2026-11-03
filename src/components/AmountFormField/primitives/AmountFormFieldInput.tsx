import type {AmountEditingKeyPressEvent} from '@components/AmountEditingController';
import {useAmountFormFieldActions, useAmountFormFieldState} from '@components/AmountFormField/context';
import type {AmountFormFieldInputProps} from '@components/AmountFormField/types';
import TextInput from '@components/TextInput';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {TextInputSelectionChangeEvent} from 'react-native';

/** Text input primitive connected to an AmountFormField root. */
function AmountFormFieldInput({
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
    testID,
    touchableInputWrapperStyle,
    style,
}: AmountFormFieldInputProps) {
    const styles = useThemeStyles();
    const {errorText, formattedNumber, selection} = useAmountFormFieldState();
    const {handleKeyPress, handleSelectionChange, setNumber} = useAmountFormFieldActions();

    const handleInputKeyPress = (event: AmountEditingKeyPressEvent) => {
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
            submitBehavior="submit"
            testID={testID}
            touchableInputWrapperStyle={touchableInputWrapperStyle}
            value={formattedNumber}
        />
    );
}

export default AmountFormFieldInput;
