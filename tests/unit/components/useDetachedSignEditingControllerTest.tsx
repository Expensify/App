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

    it('toggles the sign and deletes it before the caret through its actions', () => {
        // Given a positive value
        const {result} = renderController({value: '5'});

        // When the sign is toggled
        act(() => result.current.toggleSign());

        // Then the value is negative
        expect(result.current.value).toBe('-5');

        // When the caret is at the start and the sign before caret is deleted
        act(() => result.current.handleSelectionChange(0, 0));
        act(() => {
            const deleted = result.current.deleteSignBeforeCaret();
            expect(deleted).toBe(true);
        });

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
