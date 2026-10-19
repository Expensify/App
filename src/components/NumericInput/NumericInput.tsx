import {useDetachedSignEditingController} from '@components/NumericEditingController';
import type {NumericEditingRef} from '@components/NumericEditingController';
import ScrollView from '@components/ScrollView';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedRef, ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import {useImperativeHandle, useRef} from 'react';

import type {NumericInputActionsContextValue, NumericInputStateContextValue} from './context/types';

import {NumericInputActionsContext, NumericInputStateContext} from './context';

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
    ref?: ForwardedRef<NumericEditingRef>;

    /** Style applied to the form scroll view. */
    style?: StyleProp<ViewStyle>;

    /** Additional styles applied to the form scroll view content container. */
    scrollViewStyle?: StyleProp<ViewStyle>;

    /** Composed primitives that consume NumericInput state and actions through context. */
    children: ReactNode;
};

function NumericInput({value = '', onInputChange, allowNegative = false, decimals = 0, maxLength, errorText, ref, style, scrollViewStyle, children}: NumericInputProps) {
    const styles = useThemeStyles();
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
    };

    const actionsContextValue: NumericInputActionsContextValue = {
        setNumber: controller.setNumber,
        clearSelection: controller.clearSelection,
        toggleSign: controller.toggleSign,
        deleteSignBeforeCaret: controller.deleteSignBeforeCaret,
        handleSelectionChange: controller.handleSelectionChange,
        handleKeyPress: controller.handleKeyPress,
        focusInput,
    };

    return (
        <NumericInputStateContext.Provider value={stateContextValue}>
            <NumericInputActionsContext.Provider value={actionsContextValue}>
                <ScrollView
                    contentContainerStyle={[styles.flexGrow1, scrollViewStyle]}
                    style={style}
                >
                    {children}
                </ScrollView>
            </NumericInputActionsContext.Provider>
        </NumericInputStateContext.Provider>
    );
}

export default NumericInput;
