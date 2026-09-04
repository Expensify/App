import {normalizeNumericInput, toCanonicalValueDefault, toDisplayTextDefault} from '@components/NumericEditingController/utils';

import useLocalize from '@hooks/useLocalize';

import {replaceAllDigits, stripDecimalsFromAmount, validateAmount} from '@libs/MoneyRequestUtils';

import {useEffect, useEffectEvent, useLayoutEffect, useRef, useState} from 'react';

import useNumericSelection from './useNumericSelection';

type UseNumericEditingControllerParams = {
    value?: string;

    onInputChange?: (value: string) => void;

    allowNegative?: boolean;

    /** Number of decimal places accepted by the controller. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the controller. */
    maxLength?: number;

    /** Maps canonical values to displayed text. Defaults to identity. */
    toDisplayText?: (canonicalValue: string) => string;

    /** Maps validated text to a canonical value. Defaults to identity. */
    toCanonicalValue?: (displayText: string, previousCanonicalValue: string) => string;
};

/** Runs on mount and whenever `decimals` changes, sanitizing values that exceed the new precision. */
function useDecimalsChangeEffect(decimals: number, sanitizeForDecimals: (decimals: number) => void) {
    const previousDecimals = useRef<number | undefined>(undefined);
    const sanitizeForDecimalsEvent = useEffectEvent(sanitizeForDecimals);

    useEffect(() => {
        if (previousDecimals.current === decimals) {
            return;
        }

        previousDecimals.current = decimals;
        sanitizeForDecimalsEvent(decimals);
    }, [decimals]);
}

/** Owns numeric value, formatting, validation, and commits while delegating caret state to `useNumericSelection`. */
function useNumericEditingController({
    value: externalValueProp,
    onInputChange,
    allowNegative = false,
    decimals = 0,
    maxLength,
    toDisplayText = toDisplayTextDefault,
    toCanonicalValue = toCanonicalValueDefault,
}: UseNumericEditingControllerParams) {
    const {fromLocaleDigit, toLocaleDigit} = useLocalize();

    const externalValue = externalValueProp ?? '';

    const [currentValue, setCurrentValue] = useState(externalValue);
    const [previousExternalValue, setPreviousExternalValue] = useState(externalValue);

    // Keep the latest committed value available across batched state updates.
    const committedValueRef = useRef(externalValue);

    const isNegative = currentValue.startsWith('-');
    const formattedNumber = replaceAllDigits(toDisplayText(currentValue), toLocaleDigit);

    const {selection, collapse, reset, syncToEnd, syncAfterEdit, handleKeyPress, rejectEdit, handleNativeSelectionChange} = useNumericSelection({displayText: formattedNumber});

    // Reset when the external value is cleared. Ignore other external changes while editing.
    if (previousExternalValue !== externalValue) {
        setPreviousExternalValue(externalValue);
        if (externalValue === '') {
            setCurrentValue('');
            reset();
        }
    }

    // Commits a canonical value and returns the previously committed value.
    const applyValue = (nextValue: string, {notify = true}: {notify?: boolean} = {}) => {
        const previousValue = committedValueRef.current;

        committedValueRef.current = nextValue;
        setCurrentValue(nextValue);

        if (notify && nextValue !== previousValue) {
            onInputChange?.(nextValue);
        }

        return previousValue;
    };

    const setNumber = (inputValue: string) => {
        const numberWithLeadingZero = normalizeNumericInput(inputValue, {fromLocaleDigit, allowNegative});

        if (!validateAmount(numberWithLeadingZero, decimals, maxLength, allowNegative)) {
            rejectEdit();
            return;
        }

        const nextValue = toCanonicalValue(numberWithLeadingZero, committedValueRef.current);
        const previousValue = applyValue(nextValue);

        syncAfterEdit({previousText: toDisplayText(previousValue), nextText: toDisplayText(nextValue)});
    };

    // Replaces the canonical value without validation or notification and moves the caret to the end.
    const updateNumber = (newNumber: string) => {
        applyValue(newNumber, {notify: false});
        syncToEnd(toDisplayText(newNumber));
    };

    // Commits a canonical value without validation and without moving the caret, notifying the parent by default.
    const setCanonicalValue = (nextValue: string, {notify = true}: {notify?: boolean} = {}) => {
        applyValue(nextValue, {notify});
    };

    const getNumber = () => committedValueRef.current;

    useLayoutEffect(() => {
        // Keep the ref in sync with external resets, which bypass applyValue.
        committedValueRef.current = currentValue;
    }, [currentValue]);

    useDecimalsChangeEffect(decimals, (newDecimals) => {
        // Empty values and values already valid at the new precision need no update.
        if (externalValue === '' || validateAmount(currentValue, newDecimals, maxLength, allowNegative)) {
            return;
        }

        setNumber(toDisplayText(stripDecimalsFromAmount(currentValue)));
    });

    return {
        value: currentValue,
        formattedNumber,
        isNegative,
        selection,
        setNumber,
        setCanonicalValue,
        updateNumber,
        getNumber,
        clearSelection: collapse,
        handleSelectionChange: handleNativeSelectionChange,
        handleKeyPress,
    };
}

export default useNumericEditingController;
