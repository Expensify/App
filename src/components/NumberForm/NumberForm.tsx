import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef, ReactNode} from 'react';

import {useImperativeHandle} from 'react';

import type {NumberFormActionsContextValue, NumberFormStateContextValue} from './context/types';
import type {NumberFormRef} from './types';

import {NumberFormActionsContext, NumberFormStateContext} from './context';
import useNumberEditController from './hooks/useNumberEditController';

type NumberFormProps = {
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

function NumberForm({value = '', onInputChange, allowNegative = false, decimals = 0, maxLength, errorText, onBlur, onSubmitEditing, ref, numberFormRef, children}: NumberFormProps) {
    const controller = useNumberEditController({value, onInputChange, allowNegative, decimals, maxLength, onBlur});

    useImperativeHandle(numberFormRef, () => ({
        clearSelection: controller.clearSelection,
        getNumber: controller.getNumber,
        updateNumber: controller.updateNumber,
    }));

    const stateContextValue: NumberFormStateContextValue = {
        value: controller.value,
        externalValue: controller.externalValue,
        formattedNumber: controller.formattedNumber,
        isNegative: controller.isNegative,
        selection: controller.selection,
        allowNegative,
        errorText,
    };

    const actionsContextValue: NumberFormActionsContextValue = {
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
        <NumberFormStateContext.Provider value={stateContextValue}>
            <NumberFormActionsContext.Provider value={actionsContextValue}>{children}</NumberFormActionsContext.Provider>
        </NumberFormStateContext.Provider>
    );
}

export default NumberForm;
export type {NumberFormProps};
