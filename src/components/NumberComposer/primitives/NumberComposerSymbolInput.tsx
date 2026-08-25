import {useNumberComposerActions, useNumberComposerState} from '@components/NumberComposer/context';
import type {NumberComposerSymbolInputProps} from '@components/NumberComposer/types';
import type {NumberInputKeyPressEvent} from '@components/NumberInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextInputWithSymbol from '@components/TextInputWithSymbol';

import useLocalize from '@hooks/useLocalize';
import {useMouseActions} from '@hooks/useMouseContext';

import mergeRefs from '@libs/mergeRefs';

import CONST from '@src/CONST';

import type {MouseEvent} from 'react';
import type {BlurEvent} from 'react-native';

import {useRef} from 'react';

/**
 * Renders a numeric input with a symbol beside it. The root owns the canonical signed value; this input displays the
 * magnitude and the minus sign is rendered separately.
 */
function NumberComposerSymbolInput({
    symbol = '',
    position = 'prefix',
    hideSymbol = false,
    style,
    ref,
    onKeyPress,
    onBlur,
    accessibilityLabel,
    autoFocus,
    autoGrow = true,
    autoGrowExtraSpace,
    autoGrowMarginSide,
    contentWidth,
    containerStyle,
    disabled,
    disableKeyboard,
    hideFocusedState = true,
    keyboardType,
    onFocus,
    onPress,
    prefixCharacter,
    prefixStyle,
    prefixContainerStyle,
    shouldAllowFocusInLandscapeMode = true,
    shouldApplyPaddingToContainer,
    shouldUseDefaultLineHeightForPrefix,
    submitBehavior,
    testID,
    touchableInputWrapperStyle,
    isSymbolPressable = false,
    onSymbolButtonPress,
    symbolTextStyle,
    negativeSymbolStyle,
}: NumberComposerSymbolInputProps) {
    const {numberFormat} = useLocalize();
    const {setMouseDown, setMouseUp} = useMouseActions();
    const {formattedNumber, isNegative, selection} = useNumberComposerState();
    const {clearSign, handleBlur, handleKeyPress, handleSelectionChange, inputRef, setNumber} = useNumberComposerActions();
    const textInput = useRef<BaseTextInputRef | null>(null);

    const inputPosition = position === 'suffix' ? CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX : CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX;

    const handleInputKeyPress = (event: NumberInputKeyPressEvent) => {
        const key = event.nativeEvent.key.toLowerCase();

        if (!textInput.current?.value && key === 'backspace' && isNegative) {
            clearSign();
        }

        handleKeyPress(event);
        onKeyPress?.(event);
    };

    const handleInputBlur = (event: BlurEvent) => {
        onBlur?.(event);
        handleBlur(event);
    };

    const handleMouseDown = (event: MouseEvent<Element>) => {
        event.stopPropagation();
        setMouseDown();
    };

    const handleMouseUp = (event: MouseEvent<Element>) => {
        event.stopPropagation();
        setMouseUp();
    };

    return (
        <TextInputWithSymbol
            accessibilityLabel={accessibilityLabel}
            autoFocus={autoFocus}
            autoGrow={autoGrow}
            autoGrowExtraSpace={autoGrowExtraSpace}
            autoGrowMarginSide={autoGrowMarginSide}
            containerStyle={containerStyle}
            contentWidth={contentWidth}
            disabled={disabled}
            disableKeyboard={disableKeyboard}
            formattedAmount={formattedNumber}
            hideFocusedState={hideFocusedState}
            hideSymbol={hideSymbol}
            isNegative={isNegative}
            isSymbolPressable={isSymbolPressable}
            keyboardType={keyboardType}
            negativeSymbolStyle={negativeSymbolStyle}
            onBlur={handleInputBlur}
            onChangeAmount={setNumber}
            onFocus={onFocus}
            onKeyPress={handleInputKeyPress}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onPress={onPress}
            onSelectionChange={handleSelectionChange}
            onSymbolButtonPress={onSymbolButtonPress}
            placeholder={numberFormat(0)}
            prefixCharacter={prefixCharacter}
            prefixContainerStyle={prefixContainerStyle}
            prefixStyle={prefixStyle}
            ref={mergeRefs(textInput, inputRef, ref)}
            selection={selection}
            shouldAllowFocusInLandscapeMode={shouldAllowFocusInLandscapeMode}
            shouldApplyPaddingToContainer={shouldApplyPaddingToContainer}
            shouldUseDefaultLineHeightForPrefix={shouldUseDefaultLineHeightForPrefix}
            style={style}
            submitBehavior={submitBehavior}
            symbol={symbol}
            symbolPosition={inputPosition}
            symbolTextStyle={symbolTextStyle}
            testID={testID}
            touchableInputWrapperStyle={touchableInputWrapperStyle}
        />
    );
}

export default NumberComposerSymbolInput;
