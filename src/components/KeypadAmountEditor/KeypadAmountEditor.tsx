import {useDetachedSignEditingController} from '@components/AmountEditingController';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import {useImperativeHandle, useRef} from 'react';

import type {KeypadAmountEditorActionsContextValue, KeypadAmountEditorStateContextValue} from './context/types';
import type {KeypadAmountEditorProps} from './types';

import {KeypadAmountEditorActionsContext, KeypadAmountEditorStateContext} from './context';
import KeypadAmountLayout from './layout/KeypadAmountLayout';

function KeypadAmountEditor({
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
}: KeypadAmountEditorProps) {
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

    const stateContextValue: KeypadAmountEditorStateContextValue = {
        value: controller.value,
        formattedNumber: controller.formattedNumber,
        isNegative: controller.isNegative,
        selection: controller.selection,
        allowNegative,
        errorText,
        inputRef,
        shouldUseDynamicFontSize,
    };

    const actionsContextValue: KeypadAmountEditorActionsContextValue = {
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
        <KeypadAmountEditorStateContext.Provider value={stateContextValue}>
            <KeypadAmountEditorActionsContext.Provider value={actionsContextValue}>
                <KeypadAmountLayout
                    actions={actions}
                    footer={footer}
                    testID={testID}
                    onEmptyAreaPress={() => {
                        controller.clearSelection();
                        focusInput();
                    }}
                >
                    {children}
                </KeypadAmountLayout>
            </KeypadAmountEditorActionsContext.Provider>
        </KeypadAmountEditorStateContext.Provider>
    );
}

export default KeypadAmountEditor;
