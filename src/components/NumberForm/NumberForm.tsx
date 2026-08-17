import {useState} from 'react';

import type {SetValueOptions} from './context/types';
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

    const setValue = (nextValue: string, options?: SetValueOptions) => {
        // The updater form is used so `onPreviousValue` always sees the latest committed value, even when `setValue` is
        // called twice before the next render. `onInputChange` stays outside the updater so it never fires during render.
        setCurrentValue((committedValue) => {
            options?.onPreviousValue?.(committedValue);
            return nextValue;
        });
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
