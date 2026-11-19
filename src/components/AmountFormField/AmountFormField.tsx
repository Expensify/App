import {useAmountEditingController} from '@components/AmountEditingController';

import {useImperativeHandle} from 'react';

import type {AmountFormFieldActionsContextValue, AmountFormFieldStateContextValue} from './context/types';
import type {AmountFormFieldProps} from './types';

import {AmountFormFieldActionsContext, AmountFormFieldStateContext} from './context';

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
