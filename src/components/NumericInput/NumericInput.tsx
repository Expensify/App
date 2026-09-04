import {useNumericEditingController} from '@components/NumericEditingController';
import type {NumericEditingRef} from '@components/NumericEditingController';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';

import {useImperativeHandle, useRef} from 'react';

import type {NumericInputActionsContextValue, NumericInputStateContextValue} from './context/types';

import {NumericInputActionsContext, NumericInputStateContext} from './context';

/** The composed input displays the magnitude because the sign is rendered separately. */
const getMagnitude = (canonicalValue: string) => (canonicalValue.startsWith('-') ? canonicalValue.slice(1) : canonicalValue);

/** Preserves the sign that is rendered outside the text input while the magnitude is edited. Clearing the display text also clears the sign. */
const getSignedValue = (displayText: string, previousCanonicalValue: string, allowNegative: boolean) => {
    const shouldPreserveNegativeSign = allowNegative && displayText && !displayText.startsWith('-') && previousCanonicalValue.startsWith('-');
    return shouldPreserveNegativeSign ? `-${displayText}` : displayText;
};

type NumericInputProps = {
    /** Canonical value shared by composed primitives. Only an empty value resets editing state. */
    value?: string;

    /** Called with the canonical signed value when a composed primitive changes it. */
    onInputChange?: (value: string) => void;

    /** Whether negative values are allowed. The canonical value always stores its sign. */
    allowNegative?: boolean;

    /** Number of decimal places accepted by the composer. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the composer. */
    maxLength?: number;

    /** Error supplied by FormProvider and rendered by `NumericInput.Error`. */
    errorText?: string;

    /** Ref exposing the number editing imperative API. */
    numericInputRef?: ForwardedRef<NumericEditingRef>;

    /** Composed primitives that consume NumericInput state and actions through context. */
    children: ReactNode;
};

function NumericInput({value = '', onInputChange, allowNegative = false, decimals = 0, maxLength, errorText, numericInputRef, children}: NumericInputProps) {
    const inputRef = useRef<BaseTextInputRef | null>(null);
    const controller = useNumericEditingController({
        value,
        onInputChange,
        allowNegative,
        decimals,
        maxLength,
        toDisplayText: getMagnitude,
        toCanonicalValue: (displayText, previousCanonicalValue) => getSignedValue(displayText, previousCanonicalValue, allowNegative),
    });

    useImperativeHandle(numericInputRef, () => ({
        clearSelection: controller.clearSelection,
        getNumber: controller.getNumber,
        updateNumber: controller.updateNumber,
    }));

    // The displayed magnitude does not change when the sign toggles, so the selection remains valid.
    const toggleSign = () => {
        if (!allowNegative) {
            return;
        }

        const currentValue = controller.getNumber();
        controller.setCanonicalValue(currentValue.startsWith('-') ? currentValue.slice(1) : `-${currentValue}`);
    };

    const clearSign = () => {
        const currentValue = controller.getNumber();
        if (!currentValue.startsWith('-')) {
            return;
        }

        controller.setCanonicalValue(currentValue.slice(1));
    };

    const focusInput = () => {
        if (isTextInputFocused(inputRef)) {
            return;
        }

        inputRef.current?.focus();
    };

    const stateContextValue: NumericInputStateContextValue = {
        value: controller.value,
        formattedNumber: controller.formattedNumber,
        isNegative: allowNegative && controller.value.startsWith('-'),
        selection: controller.selection,
        allowNegative,
        errorText,
        inputRef,
    };

    const actionsContextValue: NumericInputActionsContextValue = {
        setNumber: controller.setNumber,
        clearSelection: controller.clearSelection,
        toggleSign,
        clearSign,
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
