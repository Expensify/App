import type {NumericEditingKeyPressEvent, NumericEditingSelection} from '@components/NumericEditingController/types';

import {getMagnitude, restoreSign} from '../signedMagnitude';
import useNumericEditingController from './useNumericEditingController';

type UseDetachedSignEditingControllerParams = {
    /** Canonical signed value. Only an empty value resets editing state. */
    value?: string;

    /** Called with the canonical signed value when an edit commits. */
    onInputChange?: (value: string) => void;

    /** Whether negative values are allowed. The canonical value always stores its sign. */
    allowNegative?: boolean;

    /** Number of decimal places accepted by the controller. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the controller. */
    maxLength?: number;
};

/**
 * Editing controller for inputs that display only the magnitude while the sign is rendered outside them. The canonical
 * value keeps its sign: typing a minus toggles it, pasting a signed number sets it, replacing the whole number clears it,
 * and backspace at the start of the magnitude removes it.
 */
function useDetachedSignEditingController({value, onInputChange, allowNegative = false, decimals, maxLength}: UseDetachedSignEditingControllerParams) {
    const toDisplayText = (canonicalValue: string) => (allowNegative ? getMagnitude(canonicalValue) : canonicalValue);

    const toCanonicalValue = (displayText: string, previousCanonicalValue: string, previousSelection: NumericEditingSelection) =>
        allowNegative ? restoreSign(displayText, previousCanonicalValue, previousSelection) : displayText;

    const controller = useNumericEditingController({value, onInputChange, allowNegative, decimals, maxLength, toDisplayText, toCanonicalValue});

    const isNegative = allowNegative && controller.value.startsWith('-');

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

    // The sign sits before the magnitude, so backspace with nothing before the caret deletes the sign instead
    const deleteSignBeforeCaret = () => {
        const isCaretAtStart = controller.selection.start === 0 && controller.selection.end === 0;

        if ((!controller.formattedNumber || isCaretAtStart) && isNegative) {
            clearSign();
            return true;
        }

        return false;
    };

    const handleKeyPress = (event: NumericEditingKeyPressEvent) => {
        const key = event.nativeEvent.key.toLowerCase();

        if (key === 'backspace') {
            deleteSignBeforeCaret();
        }

        controller.handleKeyPress(event);
    };

    return {
        ...controller,
        isNegative,
        toggleSign,
        deleteSignBeforeCaret,
        handleKeyPress,
    };
}

export default useDetachedSignEditingController;
