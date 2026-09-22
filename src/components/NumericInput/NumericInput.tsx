import {useNumericEditingController} from '@components/NumericEditingController';
import type {NumericEditingRef, NumericEditingSelection} from '@components/NumericEditingController';
import ScrollView from '@components/ScrollView';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedRef, ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import {useImperativeHandle, useRef} from 'react';

import type {NumericInputActionsContextValue, NumericInputStateContextValue} from './context/types';

import {NumericInputActionsContext, NumericInputStateContext} from './context';

/** The composed input displays the magnitude because the sign is rendered separately. */
const getMagnitude = (canonicalValue: string, allowNegative: boolean) => (allowNegative && canonicalValue.startsWith('-') ? canonicalValue.slice(1) : canonicalValue);

/**
 * Because the sign is rendered outside the input, this function restores it in the canonical value. Typing a minus
 * toggles the current sign, while a pasted minus sets it. A minus typed inside the magnitude is rejected as an invalid
 * edit. Replacing the whole number with a positive or empty value clears the sign.
 */
const getSignedValue = (displayText: string, wasNegative: boolean, wasSignTyped: boolean, wasNumberReplaced: boolean) => {
    if (displayText.startsWith('-')) {
        const magnitude = displayText.slice(1);
        return wasSignTyped && wasNegative && !wasNumberReplaced ? magnitude : `-${magnitude}`;
    }

    return wasNegative && !wasNumberReplaced ? `-${displayText}` : displayText;
};

/** An edit that replaced a selection spanning the whole magnitude replaced the number rather than amending it. */
const getWasNumberReplaced = (previousDisplayText: string, previousSelection: NumericEditingSelection) =>
    !!previousDisplayText && previousSelection.start === 0 && previousSelection.end === previousDisplayText.length;

const getWasSignTyped = (displayText: string, previousDisplayText: string, previousSelection: NumericEditingSelection) =>
    displayText === `${previousDisplayText.slice(0, previousSelection.start)}-${previousDisplayText.slice(previousSelection.end)}`;

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

    const toDisplayText = (canonicalValue: string) => getMagnitude(canonicalValue, allowNegative);

    const toCanonicalValue = (displayText: string, previousCanonicalValue: string, previousSelection: NumericEditingSelection) => {
        if (!allowNegative) {
            return displayText;
        }

        const previousDisplayText = toDisplayText(previousCanonicalValue);

        return getSignedValue(
            displayText,
            previousCanonicalValue.startsWith('-'),
            getWasSignTyped(displayText, previousDisplayText, previousSelection),
            getWasNumberReplaced(previousDisplayText, previousSelection),
        );
    };

    const controller = useNumericEditingController({value, onInputChange, allowNegative, decimals, maxLength, toDisplayText, toCanonicalValue});

    useImperativeHandle(ref, () => ({
        clearSelection: controller.clearSelection,
        getNumber: controller.getNumber,
        updateNumber: controller.updateNumber,
    }));

    const toggleSign = () => {
        if (!allowNegative) {
            return;
        }

        const currentValue = controller.getNumber();
        controller.setCanonicalValue(currentValue.startsWith('-') ? currentValue.slice(1) : `-${currentValue}`);
    };

    const clearSign = () => {
        const currentValue = controller.getNumber();
        if (!currentValue.startsWith('-')) {
            return;
        }

        controller.setCanonicalValue(currentValue.slice(1));
    };

    const focusInput = () => {
        if (isTextInputFocused(inputRef)) {
            return;
        }

        inputRef.current?.focus();
    };

    const stateContextValue: NumericInputStateContextValue = {
        value: controller.value,
        formattedNumber: controller.formattedNumber,
        isNegative: allowNegative && controller.value.startsWith('-'),
        selection: controller.selection,
        allowNegative,
        errorText,
        inputRef,
    };

    const actionsContextValue: NumericInputActionsContextValue = {
        setNumber: controller.setNumber,
        clearSelection: controller.clearSelection,
        toggleSign,
        clearSign,
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
