import {normalizeNumericInput} from '@components/NumericEditingController/utils';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import useLocalize from '@hooks/useLocalize';

import {replaceAllDigits, stripDecimalsFromAmount, validateAmount} from '@libs/MoneyRequestUtils';

import type {BlurEvent} from 'react-native';

import {useEffect, useEffectEvent, useLayoutEffect, useRef, useState} from 'react';

import useNumericSelection from './useNumericSelection';

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

    /** Maps a canonical value to displayed text (e.g. NumericEditing separating the minus). Defaults to identity. */
    toDisplayText?: (canonicalValue: string) => string;

    /** Maps validated display text back to the canonical value. Defaults to identity. */
    toCanonicalValue?: (displayText: string, previousCanonicalValue: string) => string;
};

const toDisplayTextDefault = (canonicalValue: string) => canonicalValue;
const toCanonicalValueDefault = (displayText: string) => displayText;

/**
 * Runs the callback whenever `decimals` changes, including on mount, where it sanitizes a value that already
 * exceeds the precision. `usePrevious` cannot back this: it reports the current value on the first render.
 */
function useDecimalsChangeEffect(decimals: number, onDecimalsChange: (decimals: number) => void) {
    const previousDecimals = useRef<number | undefined>(undefined);
    const handleDecimalsChange = useEffectEvent(onDecimalsChange);

    useEffect(() => {
        if (previousDecimals.current === decimals) {
            return;
        }

        previousDecimals.current = decimals;
        handleDecimalsChange(decimals);
    }, [decimals]);
}

/**
 * Controller owning the numeric value: its formatting, validation and commit. The caret belongs to
 * `useNumericSelection`, which the controller calls whenever an edit changes the displayed text.
 */
function useNumericEditingController({
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

    const externalValue = externalValueProp ?? '';

    const [currentValue, setCurrentValue] = useState(externalValue);
    const [previousExternalValue, setPreviousExternalValue] = useState(externalValue);

    // Synchronously tracks the latest committed value across batched state updates.
    const committedValueRef = useRef(externalValue);

    const isNegative = currentValue.startsWith('-');
    const formattedNumber = replaceAllDigits(toDisplayText(currentValue), toLocaleDigit);

    const selectionControls = useNumericSelection({displayText: formattedNumber});

    // Reset when external value is cleared; ignore other external changes while editing.
    if (previousExternalValue !== externalValue) {
        setPreviousExternalValue(externalValue);
        if (externalValue === '') {
            setCurrentValue('');
            selectionControls.reset();
        }
    }

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
        const numberWithLeadingZero = normalizeNumericInput(inputValue, {fromLocaleDigit, allowNegative});

        if (!validateAmount(numberWithLeadingZero, decimals, maxLength, allowNegative)) {
            selectionControls.rejectEdit();
            return;
        }

        const nextCanonicalValue = toCanonicalValue(numberWithLeadingZero, committedValueRef.current);
        const nextDisplayText = toDisplayText(nextCanonicalValue);
        const previousDisplayText = toDisplayText(applyValue(nextCanonicalValue));

        selectionControls.syncAfterEdit({previousText: previousDisplayText, nextText: nextDisplayText});
    };

    /** Replaces canonical value without validation or notification and moves caret to the end. */
    const updateNumber = (newNumber: string) => {
        const nextDisplayText = toDisplayText(newNumber);

        applyValue(newNumber, {notify: false});
        selectionControls.moveToEnd(nextDisplayText);
    };

    /** Commits canonical value without validation or moving caret, notifying parent by default. */
    const setValue = (nextValue: string, {notify = true}: {notify?: boolean} = {}) => {
        applyValue(nextValue, {notify});
    };

    /** Returns the canonical signed value. */
    const getNumber = () => committedValueRef.current;

    const handleBlur = (event: BlurEvent) => {
        onBlur?.(event);
    };

    useLayoutEffect(() => {
        // Catches up with the external reset, the one commit that bypasses applyValue.
        committedValueRef.current = currentValue;
    }, [currentValue]);

    useDecimalsChangeEffect(decimals, (newDecimals) => {
        // Skip if empty or already valid for the new decimal precision.
        if (externalValue === '' || validateAmount(currentValue, newDecimals, maxLength, allowNegative)) {
            return;
        }

        setNumber(toDisplayText(stripDecimalsFromAmount(currentValue)));
    });

    return {
        value: currentValue,
        externalValue,
        formattedNumber,
        isNegative,
        selection: selectionControls.selection,
        setNumber,
        setValue,
        updateNumber,
        getNumber,
        clearSelection: selectionControls.collapse,
        handleSelectionChange: selectionControls.handleNativeSelectionChange,
        handleKeyPress: selectionControls.handleKeyPress,
        handleBlur,
    };
}

export default useNumericEditingController;
