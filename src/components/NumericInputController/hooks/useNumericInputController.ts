import type {NumericInputKeyPressEvent, NumericInputSelection} from '@components/NumericInputController/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import useLocalize from '@hooks/useLocalize';

import {isMobileSafari} from '@libs/Browser';
import getOperatingSystem from '@libs/getOperatingSystem';
import {addLeadingZero, replaceAllDigits, replaceCommasWithPeriod, stripCommaFromAmount, stripDecimalsFromAmount, stripSpacesFromAmount, validateAmount} from '@libs/MoneyRequestUtils';
import shouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually';

import CONST from '@src/CONST';

import type {BlurEvent} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useLayoutEffect, useRef, useState} from 'react';

type UseNumberEditControllerParams = {
    /** Externally controlled value. Re-initializes only when reset to an empty string. */
    value?: string;

    /** Called with the canonical signed value on number edit. */
    onInputChange?: (value: string) => void;

    /** Whether negative values are allowed. */
    allowNegative?: boolean;

    /** Number of decimal places accepted by the controller. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the controller. */
    maxLength?: number;

    /** Blur callback forwarded by the form. */
    onBlur?: BaseTextInputProps['onBlur'];

    /** Maps a canonical value to displayed text (e.g. NumericInput separating the minus). Defaults to identity. */
    toDisplayText?: (canonicalValue: string) => string;

    /** Maps validated display text back to the canonical value. Defaults to identity. */
    toCanonicalValue?: (displayText: string, previousCanonicalValue: string) => string;
};

const toDisplayTextDefault = (canonicalValue: string) => canonicalValue;
const toCanonicalValueDefault = (displayText: string) => displayText;

/** Returns the new selection based on length delta. */
const getNewSelection = (oldSelection: NumericInputSelection, previousLength: number, newLength: number): NumericInputSelection => {
    const cursorPosition = oldSelection.end + (newLength - previousLength);
    return {start: cursorPosition, end: cursorPosition};
};

/** Controller managing numeric input state, formatting, validation, and cursor selection. */
function useNumericInputController({
    value: externalValueProp,
    onInputChange,
    allowNegative = false,
    decimals = 0,
    maxLength,
    onBlur,
    toDisplayText = toDisplayTextDefault,
    toCanonicalValue = toCanonicalValueDefault,
}: UseNumberEditControllerParams) {
    const {fromLocaleDigit, toLocaleDigit} = useLocalize();
    const isFocused = useIsFocused();

    const externalValue = externalValueProp ?? '';
    const initialDisplayLength = toDisplayText(externalValue).length;

    const [currentValue, setCurrentValue] = useState(externalValue);
    const [previousExternalValue, setPreviousExternalValue] = useState(externalValue);
    const [previousIsFocused, setPreviousIsFocused] = useState(isFocused);
    const [selection, setSelection] = useState<NumericInputSelection>({start: initialDisplayLength, end: initialDisplayLength});

    // Synchronously tracks the latest committed value across batched state updates.
    const committedValueRef = useRef(externalValue);
    // Clamps native selection events emitted before the updated text renders on iOS/Android.
    const numberRef = useRef<string | undefined>(undefined);
    const forwardDeletePressedRef = useRef(false);
    // Drops stale native selection events when selection is updated manually.
    const willSelectionBeUpdatedManually = useRef(false);
    // Drops the native selection event for a rejected character to preserve caret position.
    const willSelectionBeRestoredAfterInvalidInput = useRef(false);
    const previousDecimals = useRef<number | undefined>(undefined);

    // Reset when external value is cleared; ignore other external changes while editing.
    if (previousExternalValue !== externalValue) {
        setPreviousExternalValue(externalValue);
        if (externalValue === '') {
            setCurrentValue('');
            setSelection({start: 0, end: 0});
        }
    }

    // Collapse selection when returning from another screen.
    if (previousIsFocused !== isFocused) {
        setPreviousIsFocused(isFocused);
        if (isFocused && !previousIsFocused) {
            setSelection((currentSelection) => ({start: currentSelection.end, end: currentSelection.end}));
        }
    }

    const isNegative = currentValue.startsWith('-');
    const formattedNumber = replaceAllDigits(toDisplayText(currentValue), toLocaleDigit);

    const clearSelection = () => {
        setSelection((currentSelection) => ({start: currentSelection.end, end: currentSelection.end}));
    };

    /** Commits a canonical value. Returns the previously committed canonical value. */
    const applyValue = (nextValue: string, {notify = true}: {notify?: boolean} = {}) => {
        const previousValue = committedValueRef.current;

        committedValueRef.current = nextValue;
        setCurrentValue(nextValue);

        if (notify) {
            onInputChange?.(nextValue);
        }

        return previousValue;
    };

    const setNumber = (inputValue: string) => {
        // Strip spaces added by iOS Safari when pasting: https://github.com/Expensify/App/issues/16974
        const inputWithoutSpaces = stripSpacesFromAmount(inputValue);
        const newNumberWithoutSpaces = replaceAllDigits(inputWithoutSpaces, fromLocaleDigit);
        const rawFinalNumber = newNumberWithoutSpaces.includes('.') ? stripCommaFromAmount(newNumberWithoutSpaces) : replaceCommasWithPeriod(newNumberWithoutSpaces);

        const numberWithLeadingZero = addLeadingZero(rawFinalNumber, allowNegative);

        if (!validateAmount(numberWithLeadingZero, decimals, maxLength, allowNegative)) {
            // Drop native selection event for rejected input so caret stays at the previous valid position:
            // React Native syncs selection back to native by diffing against last reported native selection.
            willSelectionBeRestoredAfterInvalidInput.current = true;
            // Shallow copy forces re-render to reset native selection: https://github.com/Expensify/App/issues/16385
            setSelection((currentSelection) => ({...currentSelection}));
            return;
        }

        const nextCanonicalValue = toCanonicalValue(numberWithLeadingZero, committedValueRef.current);
        const nextDisplayText = toDisplayText(nextCanonicalValue);

        willSelectionBeUpdatedManually.current = true;
        numberRef.current = nextDisplayText;

        const previousDisplayText = toDisplayText(applyValue(nextCanonicalValue));
        const isForwardDelete = previousDisplayText.length > nextDisplayText.length && forwardDeletePressedRef.current;
        setSelection((currentSelection) => getNewSelection(currentSelection, isForwardDelete ? nextDisplayText.length : previousDisplayText.length, nextDisplayText.length));
    };

    /** Replaces canonical value without validation or notification and moves caret to the end. */
    const updateNumber = (newNumber: string) => {
        willSelectionBeUpdatedManually.current = true;
        const nextDisplayText = toDisplayText(newNumber);
        numberRef.current = nextDisplayText;
        applyValue(newNumber, {notify: false});
        setSelection({start: nextDisplayText.length, end: nextDisplayText.length});
    };

    /** Commits canonical value without validation or moving caret, notifying parent by default. */
    const setValue = (nextValue: string, {notify = true}: {notify?: boolean} = {}) => {
        applyValue(nextValue, {notify});
    };

    /** Returns the canonical signed value. */
    const getNumber = () => committedValueRef.current;

    const handleSelectionChange = (selectionStart: number, selectionEnd: number) => {
        if (willSelectionBeRestoredAfterInvalidInput.current) {
            willSelectionBeRestoredAfterInvalidInput.current = false;
            return;
        }

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

    const handleBlur = (event: BlurEvent) => {
        onBlur?.(event);
    };

    /** Detects forward-delete key press or keyboard shortcut. */
    const handleKeyPress = (event: NumericInputKeyPressEvent) => {
        const key = event.nativeEvent.key.toLowerCase();

        if (isMobileSafari() && key === CONST.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT) {
            // Optimistically anticipate forward-delete for Mac Accessibility keyboard on iOS Safari.
            forwardDeletePressedRef.current = true;
            return;
        }

        const operatingSystem = getOperatingSystem();
        const isMacOrIOS = operatingSystem === CONST.OS.MAC_OS || operatingSystem === CONST.OS.IOS;
        // Control-D is a macOS/iOS hardware keyboard shortcut for forward-delete.
        forwardDeletePressedRef.current = key === 'delete' || (isMacOrIOS && !!event.nativeEvent.ctrlKey && key === 'd');
    };

    useLayoutEffect(() => {
        committedValueRef.current = currentValue;
    }, [currentValue]);

    useLayoutEffect(() => {
        // Clear selection guards after commit, even when only selection changed.
        willSelectionBeUpdatedManually.current = false;
        willSelectionBeRestoredAfterInvalidInput.current = false;
    }, [selection, currentValue]);

    const adjustAmountOnDecimalsChange = useEffectEvent((newDecimals: number) => {
        // Skip if empty or already valid for the new decimal precision.
        if (externalValue === '' || validateAmount(currentValue, newDecimals, maxLength, allowNegative)) {
            return;
        }

        setNumber(toDisplayText(stripDecimalsFromAmount(currentValue)));
    });

    useEffect(() => {
        const hasDecimalsChanged = previousDecimals.current !== decimals;
        previousDecimals.current = decimals;

        if (!hasDecimalsChanged) {
            return;
        }

        adjustAmountOnDecimalsChange(decimals);
    }, [decimals]);

    return {
        value: currentValue,
        externalValue,
        formattedNumber,
        isNegative,
        selection,
        setNumber,
        setValue,
        updateNumber,
        getNumber,
        clearSelection,
        handleSelectionChange,
        handleKeyPress,
        handleBlur,
    };
}

export default useNumericInputController;
