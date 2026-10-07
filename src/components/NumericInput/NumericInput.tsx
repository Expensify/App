import {useSignedMagnitudeEditingController} from '@components/NumericEditingController';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useStyleUtils from '@hooks/useStyleUtils';

import {useImperativeHandle, useRef} from 'react';

import type {NumericInputActionsContextValue, NumericInputStateContextValue} from './context/types';
import type {NumericInputProps} from './types';

import {NumericInputActionsContext, NumericInputStateContext} from './context';
import NumericInputLayout from './layout/NumericInputLayout';

function NumericInput({
    value = '',
    onInputChange,
    allowNegative = false,
    decimals = 0,
    maxLength,
    errorText,
    ref,
    children,
    actions,
    footer,
    testID,
    shouldUseDynamicFontSize = false,
    symbol = '',
}: NumericInputProps) {
    const inputRef = useRef<BaseTextInputRef | null>(null);
    const StyleUtils = useStyleUtils();

    // The composed input displays only the magnitude, because the sign is rendered separately
    const controller = useSignedMagnitudeEditingController({value, onInputChange, allowNegative, decimals, maxLength});

    useImperativeHandle(ref, () => ({
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

    const dynamicAmountStyle = shouldUseDynamicFontSize ? StyleUtils.getAmountInputFontSize(controller.formattedNumber.length + symbol.length + (controller.isNegative ? 1 : 0)) : undefined;

    const stateContextValue: NumericInputStateContextValue = {
        value: controller.value,
        formattedNumber: controller.formattedNumber,
        isNegative: controller.isNegative,
        selection: controller.selection,
        allowNegative,
        errorText,
        inputRef,
        dynamicAmountStyle,
    };

    const actionsContextValue: NumericInputActionsContextValue = {
        setNumber: controller.setNumber,
        clearSelection: controller.clearSelection,
        toggleSign: controller.toggleSign,
        clearSign: controller.clearSign,
        handleSelectionChange: controller.handleSelectionChange,
        handleKeyPress: controller.handleMagnitudeKeyPress,
        focusInput,
        setShouldUpdateSelection: controller.setShouldUpdateSelection,
    };

    return (
        <NumericInputStateContext.Provider value={stateContextValue}>
            <NumericInputActionsContext.Provider value={actionsContextValue}>
                <NumericInputLayout
                    actions={actions}
                    footer={footer}
                    testID={testID}
                    onEmptyAreaPress={() => {
                        controller.clearSelection();
                        focusInput();
                    }}
                >
                    {children}
                </NumericInputLayout>
            </NumericInputActionsContext.Provider>
        </NumericInputStateContext.Provider>
    );
}

export default NumericInput;
