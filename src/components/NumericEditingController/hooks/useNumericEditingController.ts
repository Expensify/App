import {normalizeNumericInput} from '@components/NumericEditingController/utils';

import useLocalize from '@hooks/useLocalize';

import {replaceAllDigits, stripDecimalsFromAmount, validateAmount} from '@libs/MoneyRequestUtils';

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
};

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
function useNumericEditingController({value: externalValueProp, onInputChange, allowNegative = false, decimals = 0, maxLength}: UseNumberEditControllerParams) {
    const {fromLocaleDigit, toLocaleDigit} = useLocalize();

    const externalValue = externalValueProp ?? '';

    const [currentValue, setCurrentValue] = useState(externalValue);
    const [previousExternalValue, setPreviousExternalValue] = useState(externalValue);

    // Synchronously tracks the latest committed value across batched state updates.
    const committedValueRef = useRef(externalValue);

    const formattedNumber = replaceAllDigits(currentValue, toLocaleDigit);

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

        const previousValue = applyValue(numberWithLeadingZero);

        selectionControls.syncAfterEdit({previousText: previousValue, nextText: numberWithLeadingZero});
    };

    /** Replaces canonical value without validation or notification and moves caret to the end. */
    const updateNumber = (newNumber: string) => {
        applyValue(newNumber, {notify: false});
        selectionControls.moveToEnd(newNumber);
    };

    /** Returns the canonical signed value. */
    const getNumber = () => committedValueRef.current;

    useLayoutEffect(() => {
        // Catches up with the external reset, the one commit that bypasses applyValue.
        committedValueRef.current = currentValue;
    }, [currentValue]);

    useDecimalsChangeEffect(decimals, (newDecimals) => {
        // Skip if empty or already valid for the new decimal precision.
        if (externalValue === '' || validateAmount(currentValue, newDecimals, maxLength, allowNegative)) {
            return;
        }

        setNumber(stripDecimalsFromAmount(currentValue));
    });

    return {
        value: currentValue,
        formattedNumber,
        selection: selectionControls.selection,
        setNumber,
        updateNumber,
        getNumber,
        clearSelection: selectionControls.collapse,
        handleSelectionChange: selectionControls.handleNativeSelectionChange,
        handleKeyPress: selectionControls.handleKeyPress,
    };
}

export default useNumericEditingController;
