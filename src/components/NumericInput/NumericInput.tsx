import {useNumericInputController} from '@components/NumericInputController';
import type {NumericInputRef} from '@components/NumericInputController';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';

import {useImperativeHandle} from 'react';

import type {NumericInputActionsContextValue, NumericInputStateContextValue} from './context/types';

import {NumericInputActionsContext, NumericInputStateContext} from './context';

/** The composed input displays only the magnitude; the minus sign is rendered separately. */
const getMagnitude = (canonicalValue: string) => (canonicalValue.startsWith('-') ? canonicalValue.slice(1) : canonicalValue);

/**
 * Preserves the sign the input does not display when the edited magnitude is committed back to the canonical value.
 * Only when negative values are allowed: a sign installed by an updateNumber bypass while `allowNegative` is false
 * must not survive user edits (legacy rejected any further edit of such a value).
 */
const getSignedValue = (displayText: string, previousCanonicalValue: string, allowNegative: boolean) => {
    if (displayText.startsWith('-')) {
        return displayText;
    }

    if (allowNegative && previousCanonicalValue.startsWith('-')) {
        return `-${displayText}`;
    }

    return displayText;
};

type NumericInputProps = {
    /** The canonical signed value shared by composed primitives. Only a reset to an empty string re-initializes the editing state. */
    value?: string;

    /** Called with the canonical signed value when a composed primitive changes it. */
    onInputChange?: (value: string) => void;

    /** Whether negative values are allowed. The canonical value always stores its sign. */
    allowNegative?: boolean;

    /** Number of decimal places accepted by the composer. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the composer. */
    maxLength?: number;

    /** Error supplied by FormProvider. Rendered by the `NumericInput.Error` primitive wherever the composition places it. */
    errorText?: string;

    /** Form callback supplied by InputWrapper. */
    onBlur?: BaseTextInputProps['onBlur'];

    /** Submit callback supplied by InputWrapper. */
    onSubmitEditing?: BaseTextInputProps['onSubmitEditing'];

    /** Reference to the underlying text input, supplied by InputWrapper. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Reference exposing the number editing imperative API. */
    numericInputRef?: ForwardedRef<NumericInputRef>;

    children: ReactNode;
};

function NumericInput({value = '', onInputChange, allowNegative = false, decimals = 0, maxLength, errorText, onBlur, onSubmitEditing, ref, numericInputRef, children}: NumericInputProps) {
    const controller = useNumericInputController({
        value,
        onInputChange,
        allowNegative,
        decimals,
        maxLength,
        onBlur,
        toDisplayText: getMagnitude,
        toCanonicalValue: (displayText, previousCanonicalValue) => getSignedValue(displayText, previousCanonicalValue, allowNegative),
    });

    useImperativeHandle(numericInputRef, () => ({
        clearSelection: controller.clearSelection,
        getNumber: controller.getNumber,
        updateNumber: controller.updateNumber,
    }));

    // The displayed magnitude does not change when the sign toggles, so the selection stays where it is: on an empty
    // value the caret ends up right after the separately rendered minus, and the next digit becomes a negative amount.
    const toggleSign = () => {
        const currentValue = controller.getNumber();
        controller.setValue(currentValue.startsWith('-') ? currentValue.slice(1) : `-${currentValue}`);
    };

    const clearSign = () => {
        const currentValue = controller.getNumber();
        if (!currentValue.startsWith('-')) {
            return;
        }

        controller.setValue(currentValue.slice(1));
    };

    const stateContextValue: NumericInputStateContextValue = {
        value: controller.value,
        externalValue: controller.externalValue,
        formattedNumber: controller.formattedNumber,
        isNegative: controller.isNegative,
        selection: controller.selection,
        allowNegative,
        errorText,
    };

    const actionsContextValue: NumericInputActionsContextValue = {
        setNumber: controller.setNumber,
        updateNumber: controller.updateNumber,
        getNumber: controller.getNumber,
        clearSelection: controller.clearSelection,
        toggleSign,
        clearSign,
        handleSelectionChange: controller.handleSelectionChange,
        handleKeyPress: controller.handleKeyPress,
        handleBlur: controller.handleBlur,
        onSubmitEditing,
        inputRef: ref,
    };

    return (
        <NumericInputStateContext.Provider value={stateContextValue}>
            <NumericInputActionsContext.Provider value={actionsContextValue}>{children}</NumericInputActionsContext.Provider>
        </NumericInputStateContext.Provider>
    );
}

export default NumericInput;
export type {NumericInputProps};
