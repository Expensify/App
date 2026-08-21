import {useLayoutEffect, useRef, useState} from 'react';

import type {SetValueOptions} from './context/types';
import type {NumberFormProps} from './types';

import {NumberFormActionsContext, NumberFormStateContext} from './context';

function NumberForm({value = '', onInputChange, negativeMode = 'none', errorText, onBlur, onSubmitEditing, ref, numberFormRef, children}: NumberFormProps) {
    const [currentValue, setCurrentValue] = useState(value);
    const [previousValue, setPreviousValue] = useState(value);
    const committedValueRef = useRef(value);

    // Local edits can temporarily be ahead of the controlled prop, so previousValue tracks the last prop we saw instead of
    // comparing currentValue with value. The ref tracks the latest internal value synchronously because state updates may be
    // batched; this lets setValue report the correct previous value even when called more than once before a render.
    // Keep externally controlled form values in sync with the editing state.
    if (previousValue !== value) {
        setPreviousValue(value);
        setCurrentValue(value);
    }

    useLayoutEffect(() => {
        committedValueRef.current = currentValue;
    }, [currentValue]);

    const setValue = (nextValue: string, options?: SetValueOptions) => {
        const previousCommittedValue = committedValueRef.current;

        committedValueRef.current = nextValue;
        setCurrentValue(nextValue);

        if (options?.notify !== false) {
            onInputChange?.(nextValue);
        }

        return previousCommittedValue;
    };

    const stateContextValue = {
        value: currentValue,
        externalValue: value,
        negativeMode,
        errorText,
    };

    const actionsContextValue = {inputRef: ref, numberFormRef, onBlur, onSubmitEditing, setValue};

    return (
        <NumberFormStateContext.Provider value={stateContextValue}>
            <NumberFormActionsContext.Provider value={actionsContextValue}>{children}</NumberFormActionsContext.Provider>
        </NumberFormStateContext.Provider>
    );
}

export default NumberForm;
