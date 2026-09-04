import {useNumericEditingController} from '@components/NumericEditingController';
import type {NumericEditingRef} from '@components/NumericEditingController';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';

import {useImperativeHandle, useRef} from 'react';

import type {NumericInputActionsContextValue, NumericInputStateContextValue} from './context/types';

import {NumericInputActionsContext, NumericInputStateContext} from './context';

type NumericInputProps = {
    /** The canonical value shared by composed primitives. Only a reset to an empty string re-initializes the editing state. */
    value?: string;

    /** Called with the canonical value when a composed primitive changes it. */
    onInputChange?: (value: string) => void;

    /** Number of decimal places accepted by the composer. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the composer. */
    maxLength?: number;

    /** Reference exposing the number editing imperative API. */
    numericInputRef?: ForwardedRef<NumericEditingRef>;

    children: ReactNode;
};

function NumericInput({value = '', onInputChange, decimals = 0, maxLength, numericInputRef, children}: NumericInputProps) {
    const inputRef = useRef<BaseTextInputRef | null>(null);
    const controller = useNumericEditingController({
        value,
        onInputChange,
        decimals,
        maxLength,
    });

    useImperativeHandle(numericInputRef, () => ({
        clearSelection: controller.clearSelection,
        getNumber: controller.getNumber,
        updateNumber: controller.updateNumber,
    }));

    const focusInput = () => {
        if (isTextInputFocused(inputRef)) {
            return;
        }

        inputRef.current?.focus();
    };

    const stateContextValue: NumericInputStateContextValue = {
        formattedNumber: controller.formattedNumber,
        selection: controller.selection,
        inputRef,
    };

    const actionsContextValue: NumericInputActionsContextValue = {
        setNumber: controller.setNumber,
        clearSelection: controller.clearSelection,
        handleSelectionChange: controller.handleSelectionChange,
        handleKeyPress: controller.handleKeyPress,
        focusInput,
    };

    return (
        <NumericInputStateContext.Provider value={stateContextValue}>
            <NumericInputActionsContext.Provider value={actionsContextValue}>{children}</NumericInputActionsContext.Provider>
        </NumericInputStateContext.Provider>
    );
}

export default NumericInput;
