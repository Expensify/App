import {isMobileSafari} from '@libs/Browser';
import getOperatingSystem from '@libs/getOperatingSystem';
import {addLeadingZero, replaceAllDigits, replaceCommasWithPeriod, stripCommaFromAmount, stripSpacesFromAmount} from '@libs/MoneyRequestUtils';

import CONST from '@src/CONST';

import type {NumericEditingKeyPressEvent, NumericEditingSelection} from './types';

type NormalizeNumericInputOptions = {
    fromLocaleDigit: (digit: string) => string;

    allowNegative?: boolean;
};

/** Normalizes localized input to the canonical form expected by `validateAmount`, without validating it. */
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

function clampOffset(offset: number, maxLength: number): number {
    return Math.min(Math.max(offset, 0), maxLength);
}

function getSelectionAtOffset(offset: number): NumericEditingSelection {
    return {start: offset, end: offset};
}

function getSelectionAfterEdit(selection: NumericEditingSelection, previousText: string, nextText: string, wasForwardDeleteKeyPressed: boolean): NumericEditingSelection {
    const isCollapsed = selection.start === selection.end;
    const isDeletion = nextText.length < previousText.length;
    const isForwardDelete = wasForwardDeleteKeyPressed && isCollapsed && isDeletion && nextText.startsWith(previousText.slice(0, selection.start));
    const offset = isForwardDelete ? selection.end : selection.end + (nextText.length - previousText.length);

    return getSelectionAtOffset(clampOffset(offset, nextText.length));
}

function collapseSelection(selection: NumericEditingSelection): NumericEditingSelection {
    return getSelectionAtOffset(selection.end);
}

function clampSelection(selection: NumericEditingSelection, maxLength: number): NumericEditingSelection {
    return {
        start: clampOffset(selection.start, maxLength),
        end: clampOffset(selection.end, maxLength),
    };
}

export {clampSelection, collapseSelection, getSelectionAfterEdit, getSelectionAtOffset, isForwardDeleteKeyPress, normalizeNumericInput};
