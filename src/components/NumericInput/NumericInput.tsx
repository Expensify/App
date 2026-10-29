import {useDetachedSignEditingController} from '@components/NumericEditingController';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

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
}: NumericInputProps) {
    const inputRef = useRef<BaseTextInputRef | null>(null);

    const controller = useDetachedSignEditingController({value, onInputChange, allowNegative, decimals, maxLength});

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

    const stateContextValue: NumericInputStateContextValue = {
        value: controller.value,
        formattedNumber: controller.formattedNumber,
        isNegative: controller.isNegative,
        selection: controller.selection,
        allowNegative,
        errorText,
        inputRef,
        shouldUseDynamicFontSize,
    };

    const actionsContextValue: NumericInputActionsContextValue = {
        setNumber: controller.setNumber,
        insertAtSelection: controller.insertAtSelection,
        deleteBackward: controller.deleteBackward,
        clearSelection: controller.clearSelection,
        toggleSign: controller.toggleSign,
        handleSelectionChange: controller.handleSelectionChange,
        handleKeyPress: controller.handleKeyPress,
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
