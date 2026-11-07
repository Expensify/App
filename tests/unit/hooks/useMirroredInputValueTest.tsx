import {act, renderHook} from '@testing-library/react-native';

import useMirroredInputValue from '@hooks/useMirroredInputValue';

describe('useMirroredInputValue', () => {
    it('follows the stored value while the input is not being edited', () => {
        // Given an input showing a stored value that nobody is editing
        const {result, rerender} = renderHook(({storedValue}: {storedValue: string}) => useMirroredInputValue(storedValue), {initialProps: {storedValue: 'Coffee'}});
        expect(result.current.inputValue).toBe('Coffee');

        // When the stored value changes from somewhere else, such as SmartScan or another device
        rerender({storedValue: 'Coffee Shop'});

        // Then the input shows the new value
        expect(result.current.inputValue).toBe('Coffee Shop');
    });

    it('keeps what the user typed when the stored value changes mid-edit', () => {
        // Given an input the user is typing in
        const {result, rerender} = renderHook(({storedValue}: {storedValue: string}) => useMirroredInputValue(storedValue), {initialProps: {storedValue: 'Coffee'}});
        act(() => result.current.markFocused());
        act(() => result.current.setInputValue('Coffee and cake'));

        // When a write lands on the stored value before the user is done
        rerender({storedValue: 'Coffee Shop'});

        // Then the typed text stays, since replacing it would throw away the edit and move the caret
        expect(result.current.isFocused).toBe(true);
        expect(result.current.inputValue).toBe('Coffee and cake');
    });

    it('follows the stored value again once the input is left', () => {
        // Given an input that was edited and then left
        const {result, rerender} = renderHook(({storedValue}: {storedValue: string}) => useMirroredInputValue(storedValue), {initialProps: {storedValue: 'Coffee'}});
        act(() => result.current.markFocused());
        act(() => result.current.setInputValue('Tea'));
        act(() => result.current.markBlurred());

        // When the stored value changes afterwards
        rerender({storedValue: 'Tea House'});

        // Then the input picks it up
        expect(result.current.isFocused).toBe(false);
        expect(result.current.inputValue).toBe('Tea House');
    });
});
