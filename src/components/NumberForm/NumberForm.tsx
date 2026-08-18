import {useLayoutEffect, useRef, useState} from 'react';

import type {SetValueOptions} from './context/types';
import type {NumberFormProps} from './types';

import {NumberFormActionsContext, NumberFormStateContext} from './context';

function NumberForm({value = '', onInputChange, negativeMode = 'none', errorText, onBlur, onSubmitEditing, ref, numberFormRef, children}: NumberFormProps) {
    const [currentValue, setCurrentValue] = useState(value);
    const [previousValue, setPreviousValue] = useState(value);
    const committedValueRef = useRef(value);

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
        options?.onPreviousValue?.(previousCommittedValue);

        if (options?.notify !== false) {
            onInputChange?.(nextValue);
        }
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
