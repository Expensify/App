import {useNumberFormContext} from '@components/NumberForm/context';
import type {NumberFormInputBaseProps, NumberFormInputKeyPressEvent} from '@components/NumberForm/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';

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
import type {BlurEvent} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useImperativeHandle, useLayoutEffect, useRef, useState} from 'react';

type NumberSelection = {
    start: number;
    end: number;
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

function useNumberFormInputLogic({
    decimals = 0,
    maxLength,
    position = 'prefix',
    isNegative = false,
    toggleNegative,
    clearNegative,
    ref,
    onBlur: inputOnBlur,
    onKeyPress,
}: NumberFormInputBaseProps) {
    const {fromLocaleDigit, numberFormat, toLocaleDigit} = useLocalize();
    const {errorText, externalValue, inputRef, negativeMode, numberFormRef, onBlur, onSubmitEditing, setValue, value} = useNumberFormContext();

    const textInput = useRef<BaseTextInputRef | null>(null);
    const numberRef = useRef<string | undefined>(undefined);
    const forwardDeletePressedRef = useRef(false);
    // The ref is used to ignore any onSelectionChange event that happens while we are updating the selection manually in setNumber.
    const willSelectionBeUpdatedManually = useRef(false);
    // Decimal changes need to be handled once, rather than on every render of the input.
    const previousDecimals = useRef<number | undefined>(undefined);
    const [selection, setSelection] = useState<NumberSelection>({start: value.length, end: value.length});
    const isFocused = useIsFocused();
    const wasFocused = usePrevious(isFocused);

    const shouldAllowNegativeInput = negativeMode === 'inValue';
    const shouldFlipNegative = negativeMode === 'external';
    const formattedNumber = replaceAllDigits(value, toLocaleDigit);
    const inputPosition = position === 'suffix' ? CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX : CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX;

    const clearSelection = () => {
        setSelection((currentSelection) => ({start: currentSelection.end, end: currentSelection.end}));
    };

    // Clears text selection if user visits symbol (currency) selector and comes back
    useEffect(() => {
        if (!isFocused || wasFocused) {
            return;
        }

        // Focus regain is a navigation lifecycle event; collapse stale selection after returning from a child screen.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        clearSelection();
    }, [isFocused, wasFocused, clearSelection]);

    const setNumber = (inputValue: string) => {
        // Remove spaces from the new number because Safari on iOS adds spaces when pasting a copied number
        // More info: https://github.com/Expensify/App/issues/16974
        const inputWithoutSpaces = stripSpacesFromAmount(inputValue);
        const newNumberWithoutSpaces = replaceAllDigits(inputWithoutSpaces, fromLocaleDigit);
        const rawFinalNumber = newNumberWithoutSpaces.includes('.') ? stripCommaFromAmount(newNumberWithoutSpaces) : replaceCommasWithPeriod(newNumberWithoutSpaces);

        // When negative input is stored in the value, keep the negative sign as-is.
        // When the negative state is managed externally, strip the sign and call toggleNegative.
        const finalNumber = shouldAllowNegativeInput ? rawFinalNumber : handleNegativeAmountFlipping(rawFinalNumber, shouldFlipNegative, toggleNegative);
        const numberWithLeadingZero = addLeadingZero(finalNumber, shouldAllowNegativeInput);

        if (!validateAmount(numberWithLeadingZero, decimals, maxLength, shouldAllowNegativeInput)) {
            // Use a shallow copy of selection to trigger setSelection
            // More info: https://github.com/Expensify/App/issues/16385
            setSelection((currentSelection) => ({...currentSelection}));
            return;
        }

        // Keep this set through the current batch so a stale native selection event is dropped; it is cleared after the
        // committed value render so a later legitimate selection event is applied.
        willSelectionBeUpdatedManually.current = true;
        numberRef.current = numberWithLeadingZero;

        const previousNumber = setValue(numberWithLeadingZero);
        const isForwardDelete = previousNumber.length > numberWithLeadingZero.length && forwardDeletePressedRef.current;
        setSelection((currentSelection) => getNewSelection(currentSelection, isForwardDelete ? numberWithLeadingZero.length : previousNumber.length, numberWithLeadingZero.length));
    };

    useEffect(() => {
        const hasDecimalsChanged = previousDecimals.current === undefined || previousDecimals.current !== decimals;
        previousDecimals.current = decimals;

        // If the field is intentionally empty (e.g. new manual expense flow before the user enters an amount)
        // or the current number is already valid for the new decimal count, nothing to do.
        if (!hasDecimalsChanged || externalValue === '' || validateAmount(value, decimals, maxLength, shouldAllowNegativeInput || shouldFlipNegative)) {
            return;
        }

        setNumber(stripDecimalsFromAmount(value));
    }, [decimals, externalValue, maxLength, setNumber, shouldAllowNegativeInput, shouldFlipNegative, value]);

    useLayoutEffect(() => {
        // A manual update can change only the selection (for example, when setNumber() or updateNumber() receives the
        // value that is already committed). In that case `value` does not change, so include `selection` to ensure the
        // guard is still cleared after the manually controlled selection has committed.
        willSelectionBeUpdatedManually.current = false;
    }, [selection, value]);

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

        // When the number is updated in setNumber on iOS / Android, onSelectionChange formattedNumber stores the number before the update. Using numberRef allows us to read the updated number
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

    /**
     * Input handler to check for a forward-delete key (or keyboard shortcut) press.
     */
    const handleKeyPress = (event: NumberFormInputKeyPressEvent) => {
        const key = event.nativeEvent.key.toLowerCase();

        if (!textInput.current?.value && key === 'backspace' && isNegative) {
            clearNegative?.();
        }

        if (isMobileSafari() && key === CONST.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT) {
            // Optimistically anticipate forward-delete on iOS Safari (in cases where the Mac Accessibility keyboard is being
            // used for input). If the Control-D shortcut doesn't get sent, the ref will still be reset on the next key press.
            forwardDeletePressedRef.current = true;
            onKeyPress?.(event);
            return;
        }

        const operatingSystem = getOperatingSystem();
        const isMacOrIOS = operatingSystem === CONST.OS.MAC_OS || operatingSystem === CONST.OS.IOS;
        // Control-D on Mac is a keyboard shortcut for forward-delete. See https://support.apple.com/en-us/HT201236 for Mac keyboard shortcuts.
        // Also check for the keyboard shortcut on iOS in cases where a hardware keyboard may be connected to the device.
        forwardDeletePressedRef.current = key === 'delete' || (isMacOrIOS && !!event.nativeEvent.ctrlKey && key === 'd');
        onKeyPress?.(event);
    };

    // An external value can shrink between native selection events; never render a caret past the displayed text.
    const selectionForRender = {
        start: Math.min(selection.start, formattedNumber.length),
        end: Math.min(selection.end, formattedNumber.length),
    };

    return {
        errorText,
        formattedNumber,
        handleBlur,
        handleInputRef,
        handleKeyPress,
        handleSelectionChange,
        inputPosition,
        negativeMode,
        numberFormat,
        onSubmitEditing,
        selectionForRender,
        setNumber,
        shouldAllowNegativeInput,
        shouldFlipNegative,
    };
}

export default useNumberFormInputLogic;
export type {NumberSelection};
