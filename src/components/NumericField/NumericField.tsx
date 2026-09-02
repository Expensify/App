import {useNumericEditingController} from '@components/NumericEditingController';
import type {NumericEditingRef} from '@components/NumericEditingController';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';

import {useImperativeHandle} from 'react';

import type {NumericFieldActionsContextValue, NumericFieldStateContextValue} from './context/types';

import {NumericFieldActionsContext, NumericFieldStateContext} from './context';

type NumericFieldProps = {
    /** Canonical value shared by composed primitives; only an empty value resets editing state. */
    value?: string;

    /** Called with the canonical value whenever the user commits an edit. */
    onInputChange?: (value: string) => void;

    /** Whether negative values are allowed; the canonical value always stores its sign. */
    allowNegative?: boolean;

    /** Number of decimal places accepted by the form. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the form. */
    maxLength?: number;

    /** Error supplied by FormProvider and rendered by the text input. */
    errorText?: string;

    /** Called when the text input loses focus. */
    onBlur?: BaseTextInputProps['onBlur'];

    /** Called when the user presses the submit key on the text input. */
    onSubmitEditing?: BaseTextInputProps['onSubmitEditing'];

    /** Reference forwarded to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Ref exposing the number editing imperative API. */
    numericEditingRef?: ForwardedRef<NumericEditingRef>;

    /** Composed primitives that consume NumericField state and actions through context. */
    children: ReactNode;
};

function NumericField({value = '', onInputChange, allowNegative = false, decimals = 0, maxLength, errorText, onBlur, onSubmitEditing, ref, numericEditingRef, children}: NumericFieldProps) {
    const controller = useNumericEditingController({value, onInputChange, allowNegative, decimals, maxLength});

    useImperativeHandle(numericEditingRef, () => ({
        clearSelection: controller.clearSelection,
        getNumber: controller.getNumber,
        updateNumber: controller.updateNumber,
    }));

    const stateContextValue: NumericFieldStateContextValue = {
        value: controller.value,
        formattedNumber: controller.formattedNumber,
        selection: controller.selection,
        allowNegative,
        errorText,
    };

    const actionsContextValue: NumericFieldActionsContextValue = {
        setNumber: controller.setNumber,
        handleSelectionChange: controller.handleSelectionChange,
        handleKeyPress: controller.handleKeyPress,
        handleBlur: onBlur,
        onSubmitEditing,
        inputRef: ref,
    };

    return (
        <NumericFieldStateContext.Provider value={stateContextValue}>
            <NumericFieldActionsContext.Provider value={actionsContextValue}>{children}</NumericFieldActionsContext.Provider>
        </NumericFieldStateContext.Provider>
    );
}

export default NumericField;
