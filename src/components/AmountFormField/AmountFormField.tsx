import {useAmountEditingController} from '@components/AmountEditingController';
import type {AmountEditingRef} from '@components/AmountEditingController';

import type {ForwardedRef, ReactNode} from 'react';

import {useImperativeHandle} from 'react';

import type {AmountFormFieldActionsContextValue, AmountFormFieldStateContextValue} from './context/types';

import {AmountFormFieldActionsContext, AmountFormFieldStateContext} from './context';

type AmountFormFieldProps = {
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

    /** Ref exposing the number editing imperative API. */
    ref?: ForwardedRef<AmountEditingRef>;

    /** Composed primitives that consume AmountFormField state and actions through context. */
    children: ReactNode;
};

function AmountFormField({value = '', onInputChange, allowNegative = false, decimals = 0, maxLength, errorText, ref, children}: AmountFormFieldProps) {
    const controller = useAmountEditingController({value, onInputChange, allowNegative, decimals, maxLength});

    useImperativeHandle(ref, () => ({
        clearSelection: controller.clearSelection,
        getNumber: controller.getNumber,
        updateNumber: controller.updateNumber,
    }));

    const stateContextValue: AmountFormFieldStateContextValue = {
        value: controller.value,
        formattedNumber: controller.formattedNumber,
        selection: controller.selection,
        allowNegative,
        errorText,
    };

    const toggleSign = () => {
        if (!allowNegative) {
            return;
        }

        const currentValue = controller.getNumber();
        controller.setNumber(currentValue.startsWith('-') ? currentValue.slice(1) : `-${currentValue}`);
    };

    const actionsContextValue: AmountFormFieldActionsContextValue = {
        setNumber: controller.setNumber,
        toggleSign,
        handleSelectionChange: controller.handleSelectionChange,
        handleKeyPress: controller.handleKeyPress,
    };

    return (
        <AmountFormFieldStateContext.Provider value={stateContextValue}>
            <AmountFormFieldActionsContext.Provider value={actionsContextValue}>{children}</AmountFormFieldActionsContext.Provider>
        </AmountFormFieldStateContext.Provider>
    );
}

export default AmountFormField;
