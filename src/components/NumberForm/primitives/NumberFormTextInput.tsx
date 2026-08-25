import {useNumberFormActions, useNumberFormState} from '@components/NumberForm/context';
import type {NumberFormTextInputProps} from '@components/NumberForm/types';
import type {NumberInputKeyPressEvent} from '@components/NumberInput';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import mergeRefs from '@libs/mergeRefs';

import CONST from '@src/CONST';

import type {BlurEvent, TextInputSelectionChangeEvent} from 'react-native';

/**
 * Primitive text input rendered within a NumberForm root, connected to form context.
 */
function NumberFormTextInput({
    symbol = '',
    position = 'prefix',
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
    inputMode,
    label,
    onFocus,
    prefixContainerStyle,
    prefixStyle,
    shouldApplyPaddingToContainer,
    shouldUseDefaultLineHeightForPrefix,
    suffixStyle,
    onSubmitEditing: inputOnSubmitEditing,
    submitBehavior,
    testID,
    touchableInputWrapperStyle,
    style,
}: NumberFormTextInputProps) {
    const {errorText, formattedNumber, selection} = useNumberFormState();
    const {handleBlur, handleKeyPress, handleSelectionChange, inputRef, onSubmitEditing, setNumber} = useNumberFormActions();

    const isSuffix = position === 'suffix';
    const prefixCharacter = !hideSymbol && !isSuffix ? symbol : '';
    const suffixCharacter = !hideSymbol && isSuffix ? symbol : '';

    const handleInputKeyPress = (event: NumberInputKeyPressEvent) => {
        handleKeyPress(event);
        onKeyPress?.(event);
    };

    const handleInputBlur = (event: BlurEvent) => {
        onBlur?.(event);
        handleBlur(event);
    };

    const handleSubmitEditing = (event: Parameters<NonNullable<BaseTextInputProps['onSubmitEditing']>>[0]) => {
        inputOnSubmitEditing?.(event);
        onSubmitEditing?.(event);
    };

    return (
        <TextInput
            accessibilityLabel={accessibilityLabel}
            autoCapitalize="words"
            autoFocus={autoFocus}
            autoGrowExtraSpace={autoGrowExtraSpace}
            autoGrowMarginSide={autoGrowMarginSide}
            contentWidth={contentWidth}
            disabled={disabled}
            disableKeyboard={disableKeyboard}
            errorText={errorText}
            inputMode={inputMode ?? (!keyboardType ? CONST.INPUT_MODE.DECIMAL : undefined)}
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
            suffixCharacter={suffixCharacter}
            suffixStyle={suffixStyle}
            submitBehavior={submitBehavior}
            testID={testID}
            touchableInputWrapperStyle={touchableInputWrapperStyle}
            value={formattedNumber}
        />
    );
}

export default NumberFormTextInput;
