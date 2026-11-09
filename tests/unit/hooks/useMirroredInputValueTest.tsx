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
        act(() => result.current.startEditing());
        act(() => result.current.setInputValue('Coffee and cake'));

        // When a write lands on the stored value before the user is done
        rerender({storedValue: 'Coffee Shop'});

        // Then the typed text stays, since replacing it would throw away the edit and move the caret
        expect(result.current.isFocused).toBe(true);
        expect(result.current.inputValue).toBe('Coffee and cake');
    });

    it('reports what was typed when the edit ends, and nothing when the input was left as it was', () => {
        // Given an input the user focuses twice, typing only the second time
        const {result} = renderHook(({storedValue}: {storedValue: string}) => useMirroredInputValue(storedValue), {initialProps: {storedValue: 'Coffee'}});
        let untouchedResult: string | undefined = 'not called';
        act(() => result.current.startEditing());
        act(() => {
            untouchedResult = result.current.finishEditing();
        });
        let typedResult: string | undefined;
        act(() => result.current.startEditing());
        act(() => result.current.setInputValue('Tea'));
        act(() => {
            typedResult = result.current.finishEditing();
        });

        // Then only the second edit hands back a value, so a caller never saves a field the user merely tabbed through
        expect(untouchedResult).toBeUndefined();
        expect(typedResult).toBe('Tea');
    });

    it('follows a stored value that changes while the untouched input is focused', () => {
        // Given an input that is focused but not typed in
        const {result, rerender} = renderHook(({storedValue}: {storedValue: string}) => useMirroredInputValue(storedValue), {initialProps: {storedValue: 'Coffee'}});
        act(() => result.current.startEditing());

        // When the stored value changes meanwhile, and the input is then left
        rerender({storedValue: 'Coffee Shop'});
        const showsWhileFocused = result.current.inputValue;
        let editResult: string | undefined;
        act(() => {
            editResult = result.current.finishEditing();
        });

        // Then the input shows the new value at once, since there is no edit to protect, and leaving it reports no edit
        // so the old value is never written back over the new one
        expect(showsWhileFocused).toBe('Coffee Shop');
        expect(editResult).toBeUndefined();
        expect(result.current.inputValue).toBe('Coffee Shop');
    });

    it('follows the stored value again once the input is left', () => {
        // Given an input that was edited and then left
        const {result, rerender} = renderHook(({storedValue}: {storedValue: string}) => useMirroredInputValue(storedValue), {initialProps: {storedValue: 'Coffee'}});
        act(() => result.current.startEditing());
        act(() => result.current.setInputValue('Tea'));
        act(() => {
            result.current.finishEditing();
        });

        // When the stored value changes afterwards
        rerender({storedValue: 'Tea House'});

        // Then the input picks it up
        expect(result.current.isFocused).toBe(false);
        expect(result.current.inputValue).toBe('Tea House');
    });
});
