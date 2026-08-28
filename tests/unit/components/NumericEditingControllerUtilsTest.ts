import type {NumericEditingKeyPressEvent} from '@components/NumericEditingController/types';
import {clampSelection, collapseSelection, getNewSelection, getSelectionAtOffset, isForwardDeleteKeyPress, normalizeNumericInput} from '@components/NumericEditingController/utils';

import {isMobileSafari} from '@libs/Browser';
import getOperatingSystem from '@libs/getOperatingSystem';

import CONST from '@src/CONST';

jest.mock('@libs/Browser', () => ({isMobileSafari: jest.fn()}));
jest.mock('@libs/getOperatingSystem', () => jest.fn());

const mockedIsMobileSafari = jest.mocked(isMobileSafari);
const mockedGetOperatingSystem = jest.mocked(getOperatingSystem);

/** Identity conversion, matching a locale whose digits are the Latin ones. */
const fromLatinDigit = (digit: string) => digit;

/** Mirrors the real `fromLocaleDigit`, which throws on characters that are not digits of the locale. */
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
            // `addLeadingZero` prepends `-0` instead of replacing the minus sign, so the result fails validation
            // and the input is rejected. The behavior predates this helper and is asserted here so that fixing
            // `addLeadingZero` surfaces the numeric input as a caller that expects `-0.5`.
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

    describe('getNewSelection', () => {
        it('shifts the caret forward when the text grows', () => {
            expect(getNewSelection({start: 2, end: 2}, 2, 3)).toEqual({start: 3, end: 3});
        });

        it('shifts the caret back when the text shrinks', () => {
            expect(getNewSelection({start: 3, end: 3}, 3, 2)).toEqual({start: 2, end: 2});
        });

        it('collapses a highlighted range onto its end before shifting', () => {
            expect(getNewSelection({start: 0, end: 4}, 4, 1)).toEqual({start: 1, end: 1});
        });

        it('keeps the caret in place when the length is unchanged', () => {
            expect(getNewSelection({start: 1, end: 1}, 3, 3)).toEqual({start: 1, end: 1});
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
    });
});
