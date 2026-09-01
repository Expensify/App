import type {NumericEditingKeyPressEvent} from '@components/NumericEditingController';
import {useNumericFieldActions, useNumericFieldState} from '@components/NumericField/context';
import type {NumericTextInputProps} from '@components/NumericField/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import mergeRefs from '@libs/mergeRefs';

import CONST from '@src/CONST';

import type {BlurEvent, TextInputSelectionChangeEvent} from 'react-native';

/** Text input primitive connected to a NumericField root. */
function NumericTextInput({
    symbol = '',
    hideSymbol = false,
    ref,
    onKeyPress,
    onBlur,
    accessibilityLabel,
    autoFocus,
    autoGrowExtraSpace,
    autoGrowMarginSide,
    contentWidth,
    disabled,
    disableKeyboard,
    keyboardType,
    label,
    onFocus,
    prefixContainerStyle,
    prefixStyle,
    shouldApplyPaddingToContainer,
    shouldUseDefaultLineHeightForPrefix,
    onSubmitEditing: inputOnSubmitEditing,
    submitBehavior,
    testID,
    touchableInputWrapperStyle,
    style,
}: NumericTextInputProps) {
    const {errorText, formattedNumber, selection} = useNumericFieldState();
    const {handleBlur, handleKeyPress, handleSelectionChange, inputRef, onSubmitEditing, setNumber} = useNumericFieldActions();

    const prefixCharacter = !hideSymbol ? symbol : '';

    const handleInputKeyPress = (event: NumericEditingKeyPressEvent) => {
        handleKeyPress(event);
        onKeyPress?.(event);
    };

    const handleInputBlur = (event: BlurEvent) => {
        onBlur?.(event);
        handleBlur?.(event);
    };

    const handleSubmitEditing = (event: Parameters<NonNullable<BaseTextInputProps['onSubmitEditing']>>[0]) => {
        inputOnSubmitEditing?.(event);
        onSubmitEditing?.(event);
    };

    return (
        <TextInput
            accessibilityLabel={accessibilityLabel}
            // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
            // See https://github.com/Expensify/App/issues/51868 for more information
            autoCapitalize="words"
            autoFocus={autoFocus}
            autoGrowExtraSpace={autoGrowExtraSpace}
            autoGrowMarginSide={autoGrowMarginSide}
            contentWidth={contentWidth}
            disabled={disabled}
            disableKeyboard={disableKeyboard}
            errorText={errorText}
            inputMode={!keyboardType ? CONST.INPUT_MODE.DECIMAL : undefined}
            inputStyle={style}
            keyboardType={keyboardType ?? CONST.KEYBOARD_TYPE.DECIMAL_PAD}
            label={label}
            onBlur={handleInputBlur}
            onChangeText={setNumber}
            onFocus={onFocus}
            onKeyPress={handleInputKeyPress}
            onSelectionChange={(event: TextInputSelectionChangeEvent) => handleSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end)}
            onSubmitEditing={handleSubmitEditing}
            prefixCharacter={prefixCharacter}
            prefixContainerStyle={prefixContainerStyle}
            prefixStyle={prefixStyle}
            ref={mergeRefs(inputRef, ref)}
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
