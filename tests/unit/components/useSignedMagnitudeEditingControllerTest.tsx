import {act, renderHook} from '@testing-library/react-native';

import useSignedMagnitudeEditingController from '@components/NumericEditingController/hooks/useSignedMagnitudeEditingController';
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
    const hook = renderHook((props: HookProps) => useSignedMagnitudeEditingController({...props, onInputChange}), {
        initialProps: {value, allowNegative, decimals},
    });

    return {...hook, onInputChange};
}

describe('useSignedMagnitudeEditingController', () => {
    it('displays only the magnitude of a negative value', () => {
        // Given a negative canonical value
        const value = '-12';

        // When the controller is rendered
        const {result} = renderController({value});

        // Then the input text drops the sign, because the sign is rendered outside the input
        expect(result.current.formattedNumber).toBe('12');
        expect(result.current.isNegative).toBe(true);
    });

    it('keeps the minus inside the displayed text when negative values are not allowed', () => {
        // Given a value with a minus while negatives are disallowed
        const value = '-12';

        // When the controller is rendered
        const {result} = renderController({value, allowNegative: false});

        // Then nothing treats it as a sign
        expect(result.current.formattedNumber).toBe('-12');
        expect(result.current.isNegative).toBe(false);
    });

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

    it('makes a negative value positive when a minus is typed again', () => {
        // Given a negative value with the caret at the start of its magnitude
        const {result, onInputChange} = renderController({value: '-12'});
        act(() => result.current.handleSelectionChange(0, 0));

        // When the user types a minus, which toggles the sign
        act(() => result.current.setNumber('-12'));

        // Then the value is positive again
        expect(result.current.value).toBe('12');
        expect(onInputChange).toHaveBeenLastCalledWith('12');
    });

    it('keeps the sign of a pasted negative number instead of toggling it', () => {
        // Given a negative value whose whole magnitude is selected
        const {result} = renderController({value: '-12'});
        act(() => result.current.handleSelectionChange(0, 2));

        // When a negative number is pasted over it
        act(() => result.current.setNumber('-34'));

        // Then the pasted sign is kept, because a paste sets the sign rather than typing it
        expect(result.current.value).toBe('-34');
    });

    it('rejects a minus typed inside the magnitude', () => {
        // Given a positive value with the caret between its digits
        const {result, onInputChange} = renderController({value: '12'});
        act(() => result.current.handleSelectionChange(1, 1));

        // When the user types a minus there
        act(() => result.current.setNumber('1-2'));

        // Then the edit is rejected, because a sign can only lead the number
        expect(result.current.value).toBe('12');
        expect(onInputChange).not.toHaveBeenCalled();
    });

    it('clears the sign when the whole number is replaced with a positive one', () => {
        // Given a negative value whose whole magnitude is selected
        const {result} = renderController({value: '-12'});
        act(() => result.current.handleSelectionChange(0, 2));

        // When the user types a digit over the selection
        act(() => result.current.setNumber('7'));

        // Then the new number replaces the old one, sign included
        expect(result.current.value).toBe('7');
    });

    it('keeps the sign when a digit is appended to a negative value', () => {
        // Given a negative value with the caret at the end
        const {result} = renderController({value: '-12'});
        act(() => result.current.handleSelectionChange(2, 2));

        // When the user types a digit
        act(() => result.current.setNumber('123'));

        // Then only the magnitude changes
        expect(result.current.value).toBe('-123');
    });

    it('removes the sign on backspace at the start of the magnitude', () => {
        // Given a negative value with the caret at the start of its magnitude
        const {result, onInputChange} = renderController({value: '-12'});
        act(() => result.current.handleSelectionChange(0, 0));

        // When the user presses backspace, which has no digit to delete before the caret
        act(() => result.current.handleKeyPress(buildKeyPressEvent('Backspace')));

        // Then the sign is deleted instead
        expect(result.current.value).toBe('12');
        expect(onInputChange).toHaveBeenLastCalledWith('12');
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

    it('toggles and clears the sign through its actions', () => {
        // Given a positive value
        const {result} = renderController({value: '5'});

        // When the sign is toggled
        act(() => result.current.toggleSign());

        // Then the value is negative
        expect(result.current.value).toBe('-5');

        // When the sign is cleared
        act(() => result.current.clearSign());

        // Then the value is positive again
        expect(result.current.value).toBe('5');
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
