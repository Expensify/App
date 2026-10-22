import {act, renderHook} from '@testing-library/react-native';

import useDetachedSignEditingController from '@components/NumericEditingController/hooks/useDetachedSignEditingController';
import type {NumericEditingKeyPressEvent} from '@components/NumericEditingController/types';

import type ShouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually/types';

import type * as NativeNavigation from '@react-navigation/native';

jest.mock('@hooks/useLocalize', () => () => ({
    fromLocaleDigit: (digit: string) => digit,
    toLocaleDigit: (digit: string) => digit,
}));

// Apply every selection change immediately, as the web does, so the tests can place the caret before an edit
jest.mock('@libs/shouldIgnoreSelectionWhenUpdatedManually', () => ({
    ...jest.requireActual<{default: ShouldIgnoreSelectionWhenUpdatedManually}>('@libs/shouldIgnoreSelectionWhenUpdatedManually'),
    __esModule: true,
    default: false,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
}));

type HookProps = {
    value: string;
    allowNegative: boolean;
    decimals: number;
};

const buildKeyPressEvent = (key: string): NumericEditingKeyPressEvent => ({nativeEvent: {key}});

function renderController({value, allowNegative = true, decimals = 2}: Partial<HookProps> & {value: string}) {
    const onInputChange = jest.fn();
    const hook = renderHook((props: HookProps) => useDetachedSignEditingController({...props, onInputChange}), {
        initialProps: {value, allowNegative, decimals},
    });

    return {...hook, onInputChange};
}

describe('useDetachedSignEditingController', () => {
    it('makes a positive value negative when a minus is typed before the magnitude', () => {
        // Given a positive value with the caret at the start
        const {result, onInputChange} = renderController({value: '12'});
        act(() => result.current.handleSelectionChange(0, 0));

        // When the user types a minus there
        act(() => result.current.setNumber('-12'));

        // Then the minus becomes the sign of the canonical value, and the displayed magnitude is unchanged
        expect(result.current.value).toBe('-12');
        expect(result.current.formattedNumber).toBe('12');
        expect(onInputChange).toHaveBeenLastCalledWith('-12');
    });

    it('keeps the sign on backspace after a digit', () => {
        // Given a negative value with the caret after its last digit
        const {result} = renderController({value: '-12'});
        act(() => result.current.handleSelectionChange(2, 2));

        // When the user presses backspace
        act(() => result.current.handleKeyPress(buildKeyPressEvent('Backspace')));

        // Then the key press alone leaves the sign, because the input deletes the digit itself
        expect(result.current.value).toBe('-12');
    });

    it('toggles the sign and removes it through deleteBackward with the caret at the start', () => {
        // Given a positive value
        const {result} = renderController({value: '5'});

        // When the sign is toggled
        act(() => result.current.toggleSign());

        // Then the value is negative
        expect(result.current.value).toBe('-5');

        // When the caret is at the start and the pad deletes backward
        act(() => result.current.handleSelectionChange(0, 0));
        act(() => result.current.deleteBackward());

        // Then only the sign is removed, and the magnitude stays
        expect(result.current.value).toBe('5');
    });

    it('removes the sign through deleteBackward when the magnitude is empty', () => {
        // Given a negative value with no magnitude, as after the user typed only a minus
        const {result} = renderController({value: '-'});

        // When the pad deletes backward
        act(() => result.current.deleteBackward());

        // Then the sign is removed, since there is no digit to delete
        expect(result.current.value).toBe('');
    });

    it('deletes the digit and keeps the sign through deleteBackward with the caret mid-text', () => {
        // Given a negative value with the caret between its digits
        const {result} = renderController({value: '-12'});
        act(() => result.current.handleSelectionChange(1, 1));

        // When the pad deletes backward
        act(() => result.current.deleteBackward());

        // Then the digit before the caret is deleted, because something precedes the caret, and the sign stays
        expect(result.current.value).toBe('-2');
    });

    it('does nothing through deleteBackward for a positive value with the caret at the start', () => {
        // Given a positive value with the caret at the start
        const {result, onInputChange} = renderController({value: '12'});
        act(() => result.current.handleSelectionChange(0, 0));

        // When the pad deletes backward
        act(() => result.current.deleteBackward());

        // Then there is no sign or digit before the caret, so nothing changes
        expect(result.current.value).toBe('12');
        expect(onInputChange).not.toHaveBeenCalled();
    });

    it('clears only the sign on a backspace key press at the start of a negative value', () => {
        // Given a negative value with the caret at the start
        const {result} = renderController({value: '-12'});
        act(() => result.current.handleSelectionChange(0, 0));

        // When the user presses backspace on the keyboard
        act(() => result.current.handleKeyPress(buildKeyPressEvent('Backspace')));

        // Then the sign is cleared and the magnitude is untouched, so a native deletion is not doubled by the controller
        expect(result.current.value).toBe('12');
    });

    it('ignores a sign toggle when negative values are not allowed', () => {
        // Given a controller that disallows negative values
        const {result, onInputChange} = renderController({value: '5', allowNegative: false});

        // When the sign is toggled
        act(() => result.current.toggleSign());

        // Then nothing changes
        expect(result.current.value).toBe('5');
        expect(onInputChange).not.toHaveBeenCalled();
    });

    it('keeps the sign when fewer decimals strip the fraction', () => {
        // Given a negative value with two decimals
        const {result, rerender} = renderController({value: '-1.25'});

        // When the accepted decimals drop to zero
        rerender({value: '-1.25', allowNegative: true, decimals: 0});

        // Then the fraction is stripped and the sign stays
        expect(result.current.value).toBe('-1');
    });
});
