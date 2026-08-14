import FormHelpMessage from '@components/FormHelpMessage';
import {useNumberFormContext} from '@components/NumberForm/context';
import type {NumberFormInputKeyPressEvent, NumberFormInputProps} from '@components/NumberForm/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextInputWithSymbol from '@components/TextInputWithSymbol';

import useLocalize from '@hooks/useLocalize';

import {isMobileSafari} from '@libs/Browser';
import getOperatingSystem from '@libs/getOperatingSystem';
import {
    addLeadingZero,
    handleNegativeAmountFlipping,
    replaceAllDigits,
    replaceCommasWithPeriod,
    stripCommaFromAmount,
    stripDecimalsFromAmount,
    stripSpacesFromAmount,
    validateAmount,
} from '@libs/MoneyRequestUtils';
import shouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually';

import CONST from '@src/CONST';

import type {ForwardedRef} from 'react';
import type {BlurEvent, TextInputSelectionChangeEvent} from 'react-native';

import {useEffect, useImperativeHandle, useRef, useState} from 'react';

type NumberSelection = {
    start: number;
    end: number;
};

type SetNumberOptions = {
    addLeadingZero?: boolean;
    /** TextInputWithSymbol converts locale digits before calling onChangeAmount. */
    localeDigitsAlreadyNormalized?: boolean;
};

const getNewSelection = (oldSelection: NumberSelection, previousLength: number, newLength: number): NumberSelection => {
    const cursorPosition = oldSelection.end + (newLength - previousLength);
    return {start: cursorPosition, end: cursorPosition};
};

function setRef<T>(ref: ForwardedRef<T> | undefined, value: T | null) {
    if (typeof ref === 'function') {
        ref(value);
        return;
    }

    if (ref) {
        // eslint-disable-next-line no-param-reassign
        ref.current = value;
    }
}

function NumberFormInput({
    symbol = '',
    position = 'prefix',
    decimals = 0,
    maxLength,
    hideSymbol = false,
    isSymbolPressable = false,
    onSymbolButtonPress,
    displayAsTextInput = false,
    isNegative = false,
    toggleNegative,
    clearNegative,
    style,
    containerStyle,
    symbolTextStyle,
    negativeSymbolStyle,
    ref,
    autoGrow = true,
    disableKeyboard,
    hideFocusedState = true,
    keyboardType,
    onBlur: inputOnBlur,
    onFocus,
    onKeyPress,
    onSubmitEditing: inputOnSubmitEditing,
    ...rest
}: NumberFormInputProps) {
    const {fromLocaleDigit, numberFormat, toLocaleDigit} = useLocalize();
    const {errorText, inputRef, negativeMode, numberFormRef, onBlur, onSubmitEditing, setValue, value} = useNumberFormContext();

    const textInput = useRef<BaseTextInputRef | null>(null);
    const numberRef = useRef<string | undefined>(undefined);
    const forwardDeletePressedRef = useRef(false);
    const willSelectionBeUpdatedManually = useRef(false);
    const previousDecimals = useRef<number | undefined>(undefined);
    const [selection, setSelection] = useState<NumberSelection>(() => ({start: value.length, end: value.length}));

    const shouldAllowNegativeInput = negativeMode === 'inValue';
    const shouldFlipNegative = negativeMode === 'external';
    const shouldDisableKeyboard = disableKeyboard ?? !displayAsTextInput;
    const formattedNumber = replaceAllDigits(value, toLocaleDigit);
    const inputPosition = position === 'suffix' ? CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX : CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX;

    const clearSelection = () => {
        setSelection((currentSelection) => ({start: currentSelection.end, end: currentSelection.end}));
    };

    const setNumber = (inputValue: string, options: SetNumberOptions = {}) => {
        const inputWithoutSpaces = stripSpacesFromAmount(inputValue);
        const newNumberWithoutSpaces = options.localeDigitsAlreadyNormalized ? inputWithoutSpaces : replaceAllDigits(inputWithoutSpaces, fromLocaleDigit);
        const rawFinalNumber = newNumberWithoutSpaces.includes('.') ? stripCommaFromAmount(newNumberWithoutSpaces) : replaceCommasWithPeriod(newNumberWithoutSpaces);
        const finalNumber = shouldAllowNegativeInput ? rawFinalNumber : handleNegativeAmountFlipping(rawFinalNumber, shouldFlipNegative, toggleNegative);
        const numberWithOptionalLeadingZero = options.addLeadingZero ? addLeadingZero(finalNumber, shouldAllowNegativeInput) : finalNumber;

        if (!validateAmount(numberWithOptionalLeadingZero, decimals, maxLength, shouldAllowNegativeInput)) {
            setSelection((currentSelection) => ({...currentSelection}));
            return;
        }

        const strippedNumber = stripCommaFromAmount(numberWithOptionalLeadingZero);
        const isForwardDelete = value.length > strippedNumber.length && forwardDeletePressedRef.current;

        willSelectionBeUpdatedManually.current = true;
        numberRef.current = strippedNumber;
        setSelection((currentSelection) => getNewSelection(currentSelection, isForwardDelete ? strippedNumber.length : value.length, strippedNumber.length));
        setValue(strippedNumber);
    };

    useEffect(() => {
        const hasDecimalsChanged = previousDecimals.current === undefined || previousDecimals.current !== decimals;
        previousDecimals.current = decimals;

        if (!hasDecimalsChanged || value === '' || validateAmount(value, decimals, maxLength, shouldAllowNegativeInput)) {
            return;
        }

        // Keep the existing behavior when a currency or unit changes its decimal precision. This intentionally updates the root value from an effect.
        setNumber(stripDecimalsFromAmount(value));
    }, [decimals, maxLength, setNumber, shouldAllowNegativeInput, value]);

    const updateNumber = (newNumber: string) => {
        const updatedNumber = handleNegativeAmountFlipping(newNumber, shouldFlipNegative, toggleNegative);

        willSelectionBeUpdatedManually.current = true;
        numberRef.current = updatedNumber;
        setValue(updatedNumber, {notify: false});
        setSelection({start: updatedNumber.length, end: updatedNumber.length});
    };

    useImperativeHandle(numberFormRef, () => ({
        clearSelection,
        getNumber: () => value,
        updateNumber,
    }));

    const handleSelectionChange = (selectionStart: number, selectionEnd: number) => {
        if (shouldIgnoreSelectionWhenUpdatedManually && willSelectionBeUpdatedManually.current) {
            willSelectionBeUpdatedManually.current = false;
            return;
        }

        const maxSelection = numberRef.current?.length ?? formattedNumber.length;
        numberRef.current = undefined;
        setSelection({
            start: Math.min(selectionStart, maxSelection),
            end: Math.min(selectionEnd, maxSelection),
        });
    };

    const handleInputRef = (newRef: BaseTextInputRef | null) => {
        textInput.current = newRef;
        setRef(inputRef, newRef);
        setRef(ref, newRef);
    };

    const handleBlur = (event: BlurEvent) => {
        inputOnBlur?.(event);
        onBlur?.(event);
    };

    const handleSubmitEditing = (event: Parameters<NonNullable<BaseTextInputProps['onSubmitEditing']>>[0]) => {
        inputOnSubmitEditing?.(event);
        onSubmitEditing?.(event);
    };

    const handleKeyPress = (event: NumberFormInputKeyPressEvent) => {
        const key = event.nativeEvent.key.toLowerCase();

        if (!textInput.current?.value && key === 'backspace' && isNegative) {
            clearNegative?.();
        }

        if (isMobileSafari() && key === CONST.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT) {
            forwardDeletePressedRef.current = true;
            onKeyPress?.(event);
            return;
        }

        const operatingSystem = getOperatingSystem();
        const allowedOperatingSystems = [CONST.OS.MAC_OS, CONST.OS.IOS];
        forwardDeletePressedRef.current =
            key === 'delete' || (allowedOperatingSystems.some((allowedOperatingSystem) => allowedOperatingSystem === operatingSystem) && !!event.nativeEvent.ctrlKey && key === 'd');
        onKeyPress?.(event);
    };

    const selectionForRender = {
        start: Math.min(selection.start, formattedNumber.length),
        end: Math.min(selection.end, formattedNumber.length),
    };

    if (displayAsTextInput) {
        return (
            <TextInput
                {...rest}
                accessibilityLabel={rest.accessibilityLabel}
                autoCapitalize="words"
                autoFocus={rest.autoFocus}
                autoGrowExtraSpace={rest.autoGrowExtraSpace}
                autoGrowMarginSide={rest.autoGrowMarginSide}
                disabled={rest.disabled}
                disableKeyboard={shouldDisableKeyboard}
                errorText={errorText}
                inputMode={rest.inputMode ?? (!keyboardType ? CONST.INPUT_MODE.DECIMAL : undefined)}
                inputStyle={style}
                keyboardType={keyboardType ?? CONST.KEYBOARD_TYPE.DECIMAL_PAD}
                label={rest.label}
                onBlur={handleBlur}
                onChangeText={(text) => setNumber(text, {addLeadingZero: true})}
                onFocus={onFocus}
                onKeyPress={handleKeyPress}
                onSelectionChange={(event: TextInputSelectionChangeEvent) => handleSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end)}
                onSubmitEditing={handleSubmitEditing}
                prefixCharacter={hideSymbol || inputPosition !== CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX ? '' : symbol}
                prefixStyle={rest.prefixStyle}
                ref={handleInputRef}
                selection={selectionForRender}
                suffixCharacter={hideSymbol || inputPosition !== CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX ? '' : symbol}
                suffixStyle={rest.suffixStyle}
                value={formattedNumber}
            />
        );
    }

    const symbolInput = (
        <TextInputWithSymbol
            {...rest}
            accessibilityLabel={rest.accessibilityLabel}
            autoFocus={rest.autoFocus}
            autoGrow={autoGrow}
            autoGrowExtraSpace={rest.autoGrowExtraSpace}
            autoGrowMarginSide={rest.autoGrowMarginSide}
            containerStyle={containerStyle}
            disableKeyboard={shouldDisableKeyboard}
            formattedAmount={formattedNumber}
            hideFocusedState={hideFocusedState}
            hideSymbol={hideSymbol}
            isNegative={negativeMode === 'external' && isNegative}
            isSymbolPressable={isSymbolPressable}
            keyboardType={keyboardType}
            negativeSymbolStyle={negativeSymbolStyle}
            onBlur={handleBlur}
            onChangeAmount={(text) => setNumber(text, {localeDigitsAlreadyNormalized: true})}
            onFocus={onFocus}
            onKeyPress={handleKeyPress}
            onPress={rest.onPress}
            onSelectionChange={handleSelectionChange}
            onSymbolButtonPress={onSymbolButtonPress}
            placeholder={numberFormat(0)}
            ref={handleInputRef}
            selection={selectionForRender}
            shouldAllowFocusInLandscapeMode={rest.shouldAllowFocusInLandscapeMode}
            style={style}
            symbol={symbol}
            symbolPosition={inputPosition}
            symbolTextStyle={symbolTextStyle}
            toggleNegative={toggleNegative}
        />
    );

    // TODO: Unify both input paths around a shared NumberForm.Error primitive so error rendering is no longer conditional.
    return (
        <>
            {symbolInput}
            {!!errorText && <FormHelpMessage message={errorText} />}
        </>
    );
}

export default NumberFormInput;
export type {NumberFormInputProps};
