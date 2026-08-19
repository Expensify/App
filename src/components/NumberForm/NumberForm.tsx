import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';

import {useLayoutEffect, useRef, useState} from 'react';

import type {SetValueOptions} from './context/types';
import type {NumberFormRef} from './types';

import {NumberFormActionsContext, NumberFormStateContext} from './context';

type NumberFormProps = {
    /** The canonical number value shared by composed primitives. */
    value?: string;

    /** Called when a composed primitive changes the canonical value. */
    onInputChange?: (value: string) => void;

    /** Whether negative values are allowed. The canonical value always stores its sign. */
    allowNegative?: boolean;

    /** Error supplied by FormProvider. */
    errorText?: string;

    /** Form callback supplied by InputWrapper. */
    onBlur?: BaseTextInputProps['onBlur'];

    /** Submit callback supplied by InputWrapper. */
    onSubmitEditing?: BaseTextInputProps['onSubmitEditing'];

    /** Reference to the underlying text input, supplied by InputWrapper. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Reference exposing the number editing imperative API. */
    numberFormRef?: ForwardedRef<NumberFormRef>;

    children: ReactNode;
};

function NumberForm({value = '', onInputChange, allowNegative = false, errorText, onBlur, onSubmitEditing, ref, numberFormRef, children}: NumberFormProps) {
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
        allowNegative,
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
