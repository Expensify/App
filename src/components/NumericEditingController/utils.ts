
import {isMobileSafari} from '@libs/Browser';
import getOperatingSystem from '@libs/getOperatingSystem';
import {addLeadingZero, replaceAllDigits, replaceCommasWithPeriod, stripCommaFromAmount, stripSpacesFromAmount} from '@libs/MoneyRequestUtils';

import CONST from '@src/CONST';

import type {NumericEditingKeyPressEvent, NumericEditingSelection} from './types';

type NormalizeNumericInputOptions = {
    fromLocaleDigit: (digit: string) => string;

    allowNegative?: boolean;
};

/**
 * Normalizes localized numeric input to the canonical form accepted by `validateAmount`.
 * The result is unvalidated and may exceed allowed precision or length.
 */
function normalizeNumericInput(inputValue: string, {fromLocaleDigit, allowNegative = false}: NormalizeNumericInputOptions): string {
    // Remove spaces iOS Safari adds when pasting: https://github.com/Expensify/App/issues/16974
    const inputWithoutSpaces = stripSpacesFromAmount(inputValue);
    const inputWithCanonicalDigits = replaceAllDigits(inputWithoutSpaces, fromLocaleDigit);
    const inputWithPeriodSeparator = inputWithCanonicalDigits.includes('.') ? stripCommaFromAmount(inputWithCanonicalDigits) : replaceCommasWithPeriod(inputWithCanonicalDigits);

    return addLeadingZero(inputWithPeriodSeparator, allowNegative);
}

function isForwardDeleteKeyPress(event: NumericEditingKeyPressEvent): boolean {
    const key = event.nativeEvent.key.toLowerCase();

    if (isMobileSafari() && key === CONST.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT) {
        // Handle the Mac Accessibility keyboard shortcut on iOS Safari.
        return true;
    }

    const operatingSystem = getOperatingSystem();
    const isMacOrIOS = operatingSystem === CONST.OS.MAC_OS || operatingSystem === CONST.OS.IOS;

    // Control-D is the macOS/iOS hardware keyboard shortcut.
    return key === 'delete' || (isMacOrIOS && !!event.nativeEvent.ctrlKey && key === 'd');
}

function getSelectionAtOffset(offset: number): NumericEditingSelection {
    return {start: offset, end: offset};
}

/** Adjusts the selection for the displayed text's length change. */
function getNewSelection(oldSelection: NumericEditingSelection, previousLength: number, newLength: number): NumericEditingSelection {
    return getSelectionAtOffset(oldSelection.end + (newLength - previousLength));
}

function collapseSelection(selection: NumericEditingSelection): NumericEditingSelection {
    return getSelectionAtOffset(selection.end);
}

/** Clamps selection offsets when native events report positions past the text end. */
function clampSelection(selection: NumericEditingSelection, maxLength: number): NumericEditingSelection {
    return {
        start: Math.min(selection.start, maxLength),
        end: Math.min(selection.end, maxLength),
    };
}

export {clampSelection, collapseSelection, getNewSelection, getSelectionAtOffset, isForwardDeleteKeyPress, normalizeNumericInput};
export type {NormalizeNumericInputOptions};
