import {act, renderHook} from '@testing-library/react-native';

import useNumericEditingController from '@components/NumericEditingController/hooks/useNumericEditingController';

import type * as NativeNavigation from '@react-navigation/native';

jest.mock('@hooks/useLocalize', () => () => ({
    fromLocaleDigit: (digit: string) => digit,
    toLocaleDigit: (digit: string) => digit,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
}));

const renderController = (value = '123') => {
    const onInputChange = jest.fn();
    const hook = renderHook(() => useNumericEditingController({value, onInputChange}));
    return {...hook, onInputChange};
};

describe('useNumericEditingController', () => {
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
});
