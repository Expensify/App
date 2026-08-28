import {useNumericInputController} from '@components/NumericInputController';
import type {NumericInputRef} from '@components/NumericInputController';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';

import {useImperativeHandle} from 'react';

import type {NumericFieldActionsContextValue, NumericFieldStateContextValue} from './context/types';

import {NumericFieldActionsContext, NumericFieldStateContext} from './context';

type NumericFieldProps = {
    /** The canonical number value shared by composed primitives. Only a reset to an empty string re-initializes the editing state. */
    value?: string;

    /** Called when a composed primitive changes the canonical value. */
    onInputChange?: (value: string) => void;

    /** Whether negative values are allowed. The canonical value always stores its sign. */
    allowNegative?: boolean;

    /** Number of decimal places accepted by the form. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the form. */
    maxLength?: number;

    /** Error supplied by FormProvider. Rendered inline by the text input, which owns the label and error slots. */
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

function NumericField({value = '', onInputChange, allowNegative = false, decimals = 0, maxLength, errorText, onBlur, onSubmitEditing, ref, numericInputRef, children}: NumericFieldProps) {
    const controller = useNumericInputController({value, onInputChange, allowNegative, decimals, maxLength, onBlur});

    useImperativeHandle(numericInputRef, () => ({
        clearSelection: controller.clearSelection,
        getNumber: controller.getNumber,
        updateNumber: controller.updateNumber,
    }));

    const stateContextValue: NumericFieldStateContextValue = {
        value: controller.value,
        externalValue: controller.externalValue,
        formattedNumber: controller.formattedNumber,
        isNegative: controller.isNegative,
        selection: controller.selection,
        allowNegative,
        errorText,
    };

    const actionsContextValue: NumericFieldActionsContextValue = {
        setNumber: controller.setNumber,
        updateNumber: controller.updateNumber,
        getNumber: controller.getNumber,
        clearSelection: controller.clearSelection,
        handleSelectionChange: controller.handleSelectionChange,
        handleKeyPress: controller.handleKeyPress,
        handleBlur: controller.handleBlur,
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
export type {NumericFieldProps};
