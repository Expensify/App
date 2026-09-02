import type {NumericEditingKeyPressEvent} from '@components/NumericEditingController/types';
import {clampSelection, collapseSelection, getSelectionAfterEdit, getSelectionAtOffset, isForwardDeleteKeyPress, normalizeNumericInput} from '@components/NumericEditingController/utils';

import {isMobileSafari} from '@libs/Browser';
import getOperatingSystem from '@libs/getOperatingSystem';

import CONST from '@src/CONST';

jest.mock('@libs/Browser', () => ({isMobileSafari: jest.fn()}));
jest.mock('@libs/getOperatingSystem', () => jest.fn());

const mockedIsMobileSafari = jest.mocked(isMobileSafari);
const mockedGetOperatingSystem = jest.mocked(getOperatingSystem);

const fromLatinDigit = (digit: string) => digit;

const fromArabicIndicDigit = (digit: string) => {
    const index = '٠١٢٣٤٥٦٧٨٩'.indexOf(digit);

    if (index === -1) {
        throw new Error(`${digit} is not an Arabic-Indic digit`);
    }

    return String(index);
};

const buildKeyPressEvent = (key: string, ctrlKey?: boolean): NumericEditingKeyPressEvent => ({nativeEvent: {key, ctrlKey}});

describe('NumericEditingController utils', () => {
    describe('normalizeNumericInput', () => {
        it('strips spaces added when pasting on iOS Safari', () => {
            expect(normalizeNumericInput('1 234', {fromLocaleDigit: fromLatinDigit})).toBe('1234');
        });

        it('converts the comma decimal separator to a period', () => {
            expect(normalizeNumericInput('12,34', {fromLocaleDigit: fromLatinDigit})).toBe('12.34');
        });

        it('drops commas used as thousand separators when a period is already present', () => {
            expect(normalizeNumericInput('1,234.56', {fromLocaleDigit: fromLatinDigit})).toBe('1234.56');
        });

        it('adds a leading zero when only the decimal separator was entered', () => {
            expect(normalizeNumericInput('.5', {fromLocaleDigit: fromLatinDigit})).toBe('0.5');
        });

        it('adds a leading zero to a negative value when negative values are allowed', () => {
            expect(normalizeNumericInput('-1.5', {fromLocaleDigit: fromLatinDigit, allowNegative: true})).toBe('-1.5');
        });

        it('documents the leading zero addLeadingZero produces for a negative value without an integer part', () => {
            // Preserve legacy `addLeadingZero` behavior: `-.5` becomes `-0-.5` and is rejected.
            expect(normalizeNumericInput('-.5', {fromLocaleDigit: fromLatinDigit, allowNegative: true})).toBe('-0-.5');
        });

        it('leaves a negative value untouched when negative values are not allowed', () => {
            expect(normalizeNumericInput('-.5', {fromLocaleDigit: fromLatinDigit})).toBe('-.5');
        });

        it('converts locale digits to their canonical counterparts', () => {
            expect(normalizeNumericInput('١٢٣', {fromLocaleDigit: fromArabicIndicDigit})).toBe('123');
        });

        it('preserves characters the locale conversion rejects', () => {
            expect(normalizeNumericInput('١٢.٣', {fromLocaleDigit: fromArabicIndicDigit})).toBe('12.3');
        });

        it('returns an empty string unchanged', () => {
            expect(normalizeNumericInput('', {fromLocaleDigit: fromLatinDigit})).toBe('');
        });
    });

    describe('isForwardDeleteKeyPress', () => {
        beforeEach(() => {
            mockedIsMobileSafari.mockReturnValue(false);
            mockedGetOperatingSystem.mockReturnValue(CONST.OS.WINDOWS);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('detects the dedicated forward-delete key regardless of casing', () => {
            expect(isForwardDeleteKeyPress(buildKeyPressEvent('Delete'))).toBe(true);
        });

        it('ignores backspace', () => {
            expect(isForwardDeleteKeyPress(buildKeyPressEvent('Backspace'))).toBe(false);
        });

        it('detects Control-D on macOS', () => {
            mockedGetOperatingSystem.mockReturnValue(CONST.OS.MAC_OS);

            expect(isForwardDeleteKeyPress(buildKeyPressEvent('d', true))).toBe(true);
        });

        it('detects Control-D on iOS', () => {
            mockedGetOperatingSystem.mockReturnValue(CONST.OS.IOS);

            expect(isForwardDeleteKeyPress(buildKeyPressEvent('d', true))).toBe(true);
        });

        it('ignores Control-D on other operating systems', () => {
            expect(isForwardDeleteKeyPress(buildKeyPressEvent('d', true))).toBe(false);
        });

        it('ignores the letter d pressed without the control key', () => {
            mockedGetOperatingSystem.mockReturnValue(CONST.OS.MAC_OS);

            expect(isForwardDeleteKeyPress(buildKeyPressEvent('d'))).toBe(false);
        });

        it('anticipates forward-delete for the control key on iOS Safari', () => {
            mockedIsMobileSafari.mockReturnValue(true);

            expect(isForwardDeleteKeyPress(buildKeyPressEvent(CONST.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT))).toBe(true);
        });

        it('ignores the control key outside iOS Safari', () => {
            expect(isForwardDeleteKeyPress(buildKeyPressEvent(CONST.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT))).toBe(false);
        });
    });

    describe('getSelectionAtOffset', () => {
        it('returns a collapsed selection at the offset', () => {
            expect(getSelectionAtOffset(3)).toEqual({start: 3, end: 3});
        });
    });

    describe('getSelectionAfterEdit', () => {
        it('shifts the caret forward by the characters an insertion added', () => {
            expect(getSelectionAfterEdit({start: 2, end: 2}, '12', '123', false)).toEqual({start: 3, end: 3});
        });

        it('keeps the caret at the edit site when text is inserted before it', () => {
            expect(getSelectionAfterEdit({start: 1, end: 1}, '13', '123', false)).toEqual({start: 2, end: 2});
        });

        it('shifts the caret back by the characters a backspace removed', () => {
            expect(getSelectionAfterEdit({start: 3, end: 3}, '123', '12', false)).toEqual({start: 2, end: 2});
        });

        it('shifts the caret back past a repeated character a backspace removed', () => {
            // The removed character is identical to the one before it, so only the reported caret tells them apart.
            expect(getSelectionAfterEdit({start: 2, end: 2}, '111', '11', false)).toEqual({start: 1, end: 1});
        });

        it('collapses a replaced range onto the end of what replaced it', () => {
            expect(getSelectionAfterEdit({start: 0, end: 4}, '1234', '9', false)).toEqual({start: 1, end: 1});
        });

        it('collapses a deleted range onto its start', () => {
            expect(getSelectionAfterEdit({start: 1, end: 3}, '12345', '145', false)).toEqual({start: 1, end: 1});
        });

        it('leaves the caret in place after a forward-delete, which removes the character after it', () => {
            expect(getSelectionAfterEdit({start: 1, end: 1}, '123', '13', true)).toEqual({start: 1, end: 1});
        });

        it('ignores a forward-delete key press when the edit added characters', () => {
            expect(getSelectionAfterEdit({start: 2, end: 2}, '12', '123', true)).toEqual({start: 3, end: 3});
        });

        it('ignores a forward-delete key press when a range was replaced by shorter text', () => {
            // A stale flag from a forward-delete that removed nothing must not strand the caret before pasted text.
            expect(getSelectionAfterEdit({start: 1, end: 4}, '12345', '195', true)).toEqual({start: 2, end: 2});
        });

        it('ignores a forward-delete key press when the text before the caret changed', () => {
            expect(getSelectionAfterEdit({start: 3, end: 3}, '123', '12', true)).toEqual({start: 2, end: 2});
        });

        it('keeps the caret in place when the length is unchanged', () => {
            expect(getSelectionAfterEdit({start: 1, end: 1}, '1.2', '1,2', false)).toEqual({start: 1, end: 1});
        });

        it('clamps the caret to the start when an edit strips more than sits before it', () => {
            // Reducing the accepted precision rewrites the value regardless of where the caret is.
            expect(getSelectionAfterEdit({start: 0, end: 0}, '12.34', '12', false)).toEqual({start: 0, end: 0});
        });

        it('clamps the caret to the end of the remaining text', () => {
            // A forward-delete flag held over from a key press that removed nothing must not hold the offset in place.
            expect(getSelectionAfterEdit({start: 5, end: 5}, '12.34', '12', true)).toEqual({start: 2, end: 2});
        });
    });

    describe('collapseSelection', () => {
        it('collapses a highlighted range onto its end', () => {
            expect(collapseSelection({start: 0, end: 4})).toEqual({start: 4, end: 4});
        });

        it('leaves an already collapsed selection unchanged', () => {
            expect(collapseSelection({start: 2, end: 2})).toEqual({start: 2, end: 2});
        });
    });

    describe('clampSelection', () => {
        it('clamps offsets reported past the end of the displayed text', () => {
            expect(clampSelection({start: 6, end: 8}, 4)).toEqual({start: 4, end: 4});
        });

        it('leaves a selection within the displayed text unchanged', () => {
            expect(clampSelection({start: 1, end: 3}, 4)).toEqual({start: 1, end: 3});
        });

        it('clamps negative offsets onto the start of the text', () => {
            expect(clampSelection({start: -2, end: -1}, 4)).toEqual({start: 0, end: 0});
        });
    });
});
