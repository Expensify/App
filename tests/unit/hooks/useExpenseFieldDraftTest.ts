import {act, renderHook} from '@testing-library/react-native';

import useExpenseFieldDraft from '@hooks/useExpenseFieldDraft';

describe('useExpenseFieldDraft', () => {
    it('accepts scan updates until the user edits the field', () => {
        // Given an untouched field whose transaction is still scanning
        const {result, rerender} = renderHook(({storedValue}) => useExpenseFieldDraft('transaction-a', storedValue), {initialProps: {storedValue: ''}});

        // When the scan populates the field
        rerender({storedValue: 'Scanned merchant'});

        // Then the editor displays the scan result rather than freezing its initial empty value
        expect(result.current.at(0)).toBe('Scanned merchant');
    });

    it.each(['Unsaved value', ''])('preserves the user edit %j when scan data changes', (draftValue) => {
        // Given a user typed or deliberately cleared a field before synchronization completed
        const {result, rerender} = renderHook(({storedValue}) => useExpenseFieldDraft('transaction-a', storedValue), {initialProps: {storedValue: 'Original value'}});
        act(() => {
            const [, updateDraft] = result.current;
            updateDraft(draftValue);
        });

        // When the scan returns a different server value
        rerender({storedValue: 'Scanned value'});

        // Then the unsaved value, including an intentional empty string, remains authoritative
        expect(result.current.at(0)).toBe(draftValue);
    });

    it('does not apply one expense draft to a different transaction', () => {
        // Given the current expense has unsaved input
        const {result, rerender} = renderHook(({transactionID, storedValue}) => useExpenseFieldDraft(transactionID, storedValue), {
            initialProps: {transactionID: 'transaction-a', storedValue: 'Original A'},
        });
        act(() => {
            const [, updateDraft] = result.current;
            updateDraft('Unsaved A');
        });

        // When the editor is reused for another expense
        rerender({transactionID: 'transaction-b', storedValue: 'Original B'});

        // Then the other expense receives its own value, not the previous draft
        expect(result.current.at(0)).toBe('Original B');
    });

    it('discards local input when the editor closes instead of persisting it globally', () => {
        // Given the user changes a field without saving it
        const {result, unmount} = renderHook(() => useExpenseFieldDraft('transaction-a', 'Original value'));
        act(() => {
            const [, updateDraft] = result.current;
            updateDraft('Unsaved value');
        });

        // When that editor closes and the expense is opened again
        unmount();
        const reopened = renderHook(() => useExpenseFieldDraft('transaction-a', 'Original value'));

        // Then the unsaved value has not been written to the expense or a shared form draft
        expect(reopened.result.current.at(0)).toBe('Original value');
    });
});
