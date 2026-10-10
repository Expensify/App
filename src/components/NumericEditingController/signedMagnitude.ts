import type {NumericEditingSelection} from './types';

function getMagnitude(canonicalValue: string): string {
    return canonicalValue.startsWith('-') ? canonicalValue.slice(1) : canonicalValue;
}

function isWholeMagnitudeSelected(magnitude: string, selection: NumericEditingSelection): boolean {
    return !!magnitude && selection.start === 0 && selection.end === magnitude.length;
}

function isMinusTypedAtStart(displayText: string, previousMagnitude: string, selection: NumericEditingSelection): boolean {
    return selection.start === 0 && displayText === `-${previousMagnitude.slice(selection.end)}`;
}

/**
 * Restores the sign the input does not display. Replacing the whole number takes the new text as it is, a minus typed
 * at the start toggles the sign, a pasted minus sets it, and any other edit keeps the previous sign.
 */
function restoreSign(displayText: string, previousCanonicalValue: string, previousSelection: NumericEditingSelection): string {
    const previousMagnitude = getMagnitude(previousCanonicalValue);
    const wasNegative = previousCanonicalValue.startsWith('-');

    if (isWholeMagnitudeSelected(previousMagnitude, previousSelection)) {
        return displayText;
    }
    if (isMinusTypedAtStart(displayText, previousMagnitude, previousSelection)) {
        return wasNegative ? displayText.slice(1) : displayText;
    }
    if (!wasNegative || displayText.startsWith('-')) {
        return displayText;
    }
    return `-${displayText}`;
}

export {getMagnitude, restoreSign};
