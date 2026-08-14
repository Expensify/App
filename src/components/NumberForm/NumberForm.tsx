import {useState} from 'react';

import type {NumberFormProps} from './types';

import {NumberFormActionsContext, NumberFormStateContext} from './context';

function NumberForm({value = '', onInputChange, negativeMode = 'none', errorText, onBlur, onSubmitEditing, ref, numberFormRef, children}: NumberFormProps) {
    const [currentValue, setCurrentValue] = useState(value);
    const [previousValue, setPreviousValue] = useState(value);

    // Keep externally controlled form values in sync with the editing state.
    if (previousValue !== value) {
        setPreviousValue(value);
        setCurrentValue(value);
    }

    const setValue = (nextValue: string, options?: {notify?: boolean}) => {
        setCurrentValue(nextValue);
        if (options?.notify !== false) {
            onInputChange?.(nextValue);
        }
    };

    const stateContextValue = {
        value: currentValue,
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
