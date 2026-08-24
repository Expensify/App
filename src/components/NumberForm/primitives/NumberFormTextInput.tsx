import useNumberFormInputLogic from '@components/NumberForm/hooks/useNumberFormInputLogic';
import type {NumberFormTextInputProps} from '@components/NumberForm/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import CONST from '@src/CONST';

import type {TextInputSelectionChangeEvent} from 'react-native';

function NumberFormTextInput(props: NumberFormTextInputProps) {
    const {
        symbol = '',
        position,
        decimals,
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
        maxLength,
    } = props;
    const {errorText, formattedNumber, handleBlur, handleInputRef, handleKeyPress, handleSelectionChange, inputPosition, onSubmitEditing, selectionForRender, setNumber} =
        useNumberFormInputLogic({
            decimals,
            maxLength,
            position,
            ref,
            onBlur,
            onKeyPress,
        });
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
            onBlur={handleBlur}
            onChangeText={setNumber}
            onFocus={onFocus}
            onKeyPress={handleKeyPress}
            onSelectionChange={(event: TextInputSelectionChangeEvent) => handleSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end)}
            onSubmitEditing={handleSubmitEditing}
            prefixCharacter={hideSymbol || inputPosition !== CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX ? '' : symbol}
            prefixContainerStyle={prefixContainerStyle}
            prefixStyle={prefixStyle}
            ref={handleInputRef}
            selection={selectionForRender}
            shouldApplyPaddingToContainer={shouldApplyPaddingToContainer}
            shouldUseDefaultLineHeightForPrefix={shouldUseDefaultLineHeightForPrefix}
            suffixCharacter={hideSymbol || inputPosition !== CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX ? '' : symbol}
            suffixStyle={suffixStyle}
            submitBehavior={submitBehavior}
            testID={testID}
            touchableInputWrapperStyle={touchableInputWrapperStyle}
            value={formattedNumber}
        />
    );
}

export default NumberFormTextInput;
