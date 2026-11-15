import {act, renderHook} from '@testing-library/react-native';

import useAmountEditingController from '@components/AmountEditingController/hooks/useAmountEditingController';

import type * as NativeNavigation from '@react-navigation/native';

jest.mock('@hooks/useLocalize', () => () => ({
    fromLocaleDigit: (digit: string) => digit,
    toLocaleDigit: (digit: string) => digit,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
}));

const renderController = (value = '123', options: Partial<Parameters<typeof useAmountEditingController>[0]> = {}) => {
    const onInputChange = jest.fn();
    const hook = renderHook(() => useAmountEditingController({value, onInputChange, ...options}));
    return {...hook, onInputChange};
};

describe('useAmountEditingController', () => {
    describe('insertAtSelection', () => {
        it('inserts text at a collapsed caret', () => {
            // Given a controller whose caret sits between "1" and "23"
            const {result, onInputChange} = renderController('123');
            act(() => {
                result.current.handleSelectionChange(1, 1);
            });

            // When text is inserted
            act(() => {
                result.current.insertAtSelection('9');
            });

            // Then the text lands at the caret rather than at the end
            expect(onInputChange).toHaveBeenLastCalledWith('1923');
        });

        it('replaces a selected range', () => {
            // Given a controller with "23" highlighted
            const {result, onInputChange} = renderController('123');
            act(() => {
                result.current.handleSelectionChange(1, 3);
            });

            // When text is inserted
            act(() => {
                result.current.insertAtSelection('9');
            });

            // Then the highlighted range is replaced, as typing over a selection does
            expect(onInputChange).toHaveBeenLastCalledWith('19');
        });

        it('inserts text at the start when the caret is at the start', () => {
            // Given a controller whose caret sits before the first digit
            const {result, onInputChange} = renderController('123');
            act(() => {
                result.current.handleSelectionChange(0, 0);
            });

            // When text is inserted
            act(() => {
                result.current.insertAtSelection('9');
            });

            // Then the text is prepended
            expect(onInputChange).toHaveBeenLastCalledWith('9123');
        });
    });

    describe('deleteBackward', () => {
        it('deletes the character before a collapsed caret', () => {
            // Given a controller whose caret sits between "12" and "3"
            const {result, onInputChange} = renderController('123');
            act(() => {
                result.current.handleSelectionChange(2, 2);
            });

            // When backspace is applied
            act(() => {
                result.current.deleteBackward();
            });

            // Then only the character before the caret is removed
            expect(onInputChange).toHaveBeenLastCalledWith('13');
        });

        it('deletes a selected range', () => {
            // Given a controller with "23" highlighted
            const {result, onInputChange} = renderController('123');
            act(() => {
                result.current.handleSelectionChange(1, 3);
            });

            // When backspace is applied
            act(() => {
                result.current.deleteBackward();
            });

            // Then the whole range is removed and no extra character before it
            expect(onInputChange).toHaveBeenLastCalledWith('1');
        });

        it('does nothing when the caret is at the start', () => {
            // Given a controller whose caret sits before the first digit
            const {result, onInputChange} = renderController('123');
            act(() => {
                result.current.handleSelectionChange(0, 0);
            });

            // When backspace is applied
            act(() => {
                result.current.deleteBackward();
            });

            // Then there is nothing before the caret to delete, so the value is unchanged
            expect(onInputChange).not.toHaveBeenCalled();
            expect(result.current.formattedNumber).toBe('123');
        });
    });

    describe('updateNumber', () => {
        it('updates number and moves caret to end without notifying onInputChange', () => {
            // Given a controller initialized with value "10"
            const {result, onInputChange} = renderController('10');

            // When updateNumber is called imperatively with a new value
            act(() => {
                result.current.updateNumber('25');
            });

            // Then the value is updated synchronously and caret is moved to the end without notifying onInputChange
            expect(result.current.getNumber()).toBe('25');
            expect(result.current.value).toBe('25');
            expect(result.current.formattedNumber).toBe('25');
            expect(result.current.selection).toEqual({start: 2, end: 2});
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('bypasses validation limits (decimals, maxLength and allowNegative)', () => {
            // Given a controller configured with 2 decimals and no negative input
            const {result} = renderController('10.00', {decimals: 2, maxLength: 5, allowNegative: false});

            // When updateNumber is called imperatively with a negative value having more decimals and digits than allowed
            act(() => {
                result.current.updateNumber('-123456.789');
            });

            // Then the canonical value is applied directly without being constrained by validation rules
            expect(result.current.getNumber()).toBe('-123456.789');
            expect(result.current.value).toBe('-123456.789');
            expect(result.current.selection).toEqual({start: 11, end: 11});
        });
    });
});
