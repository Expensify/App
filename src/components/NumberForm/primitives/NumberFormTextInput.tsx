import useNumberFormInputLogic from '@components/NumberForm/hooks/useNumberFormInputLogic';
import type {NumberFormTextInputProps} from '@components/NumberForm/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import CONST from '@src/CONST';

import type {TextInputSelectionChangeEvent} from 'react-native';

function NumberFormTextInput(props: NumberFormTextInputProps) {
    const {
        symbol = '',
        hideSymbol = false,
        disableKeyboard,
        keyboardType,
        inputMode,
        label,
        prefixStyle,
        suffixStyle,
        onSubmitEditing: inputOnSubmitEditing,
        style,
        maxLength,
        ...rest
    } = props;
    const {errorText, formattedNumber, handleBlur, handleInputRef, handleKeyPress, handleSelectionChange, inputPosition, onSubmitEditing, selectionForRender, setNumber} =
        useNumberFormInputLogic({...props, maxLength});
    const handleSubmitEditing = (event: Parameters<NonNullable<BaseTextInputProps['onSubmitEditing']>>[0]) => {
        inputOnSubmitEditing?.(event);
        onSubmitEditing?.(event);
    };

    return (
        <TextInput
            {...rest}
            accessibilityLabel={rest.accessibilityLabel}
            autoCapitalize="words"
            autoFocus={rest.autoFocus}
            autoGrowExtraSpace={rest.autoGrowExtraSpace}
            autoGrowMarginSide={rest.autoGrowMarginSide}
            disabled={rest.disabled}
            disableKeyboard={disableKeyboard ?? false}
            errorText={errorText}
            inputMode={inputMode ?? (!keyboardType ? CONST.INPUT_MODE.DECIMAL : undefined)}
            inputStyle={style}
            keyboardType={keyboardType ?? CONST.KEYBOARD_TYPE.DECIMAL_PAD}
            label={label}
            onBlur={handleBlur}
            onChangeText={setNumber}
            onFocus={rest.onFocus}
            onKeyPress={handleKeyPress}
            onSelectionChange={(event: TextInputSelectionChangeEvent) => handleSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end)}
            onSubmitEditing={handleSubmitEditing}
            prefixCharacter={hideSymbol || inputPosition !== CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX ? '' : symbol}
            prefixStyle={prefixStyle}
            ref={handleInputRef}
            selection={selectionForRender}
            suffixCharacter={hideSymbol || inputPosition !== CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX ? '' : symbol}
            suffixStyle={suffixStyle}
            value={formattedNumber}
        />
    );
}

export default NumberFormTextInput;
