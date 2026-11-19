import {renderHook} from '@testing-library/react-native';

import usePreviousDefined from '@hooks/usePreviousDefined';

type ScopedValue = {value: string | undefined; resetKey: number};

function renderScopedValue(initialProps: ScopedValue) {
    return renderHook(({value, resetKey}: ScopedValue) => usePreviousDefined(value, resetKey), {initialProps});
}

describe('usePreviousDefined', () => {
    it.each(['query', '', 0, false, null])('preserves the fallback without a reset key for %p', (value) => {
        // Given an existing caller without a reset key
        const {result, rerender} = renderHook<typeof value | undefined, typeof value | undefined>((input) => usePreviousDefined(input), {initialProps: value});

        // When the input becomes undefined
        rerender(undefined);

        // Then defined values, including falsy values and null, keep their existing behavior
        expect(result.current).toBe(value);
    });

    it('starts without a fallback when the input is undefined', () => {
        // Given no value has been recorded in the current scope
        const {result, rerender} = renderScopedValue({value: undefined, resetKey: 1});

        // When the account changes without a query
        rerender({value: undefined, resetKey: 2});

        // Then there is still no fallback
        expect(result.current).toBeUndefined();
    });

    it.each([
        [1, 2],
        [2, 1],
    ])('does not reuse a fallback when switching from account %s to %s', (previousAccountID, accountID) => {
        // Given a query recorded in the previous account
        const {result, rerender} = renderScopedValue({value: 'old query', resetKey: previousAccountID});
        rerender({value: undefined, resetKey: previousAccountID});
        expect(result.current).toBe('old query');

        // When the account changes, the old fallback must be rejected on that render
        rerender({value: undefined, resetKey: accountID});
        expect(result.current).toBeUndefined();

        // Then only a query recorded in the new account can be retained
        rerender({value: 'new query', resetKey: accountID});
        rerender({value: undefined, resetKey: accountID});
        expect(result.current).toBe('new query');
    });

    it('does not record an unchanged input under a new reset key', () => {
        // Given navigation still exposes the old query when the account changes
        const {result, rerender} = renderScopedValue({value: 'old query', resetKey: 1});

        // When only the account changes and an unrelated render occurs before the navigation reset
        rerender({value: 'old query', resetKey: 2});
        rerender({value: 'old query', resetKey: 2});
        rerender({value: undefined, resetKey: 2});

        // Then the old query was not relabeled as a fallback for the new account
        expect(result.current).toBeUndefined();
    });

    it('records the same query again after an undefined input in the new account', () => {
        // Given the old account recorded the same query text
        const {result, rerender} = renderScopedValue({value: 'shared query', resetKey: 1});
        rerender({value: undefined, resetKey: 2});

        // When the new account explicitly opens that query
        rerender({value: 'shared query', resetKey: 2});
        rerender({value: undefined, resetKey: 2});

        // Then it is a valid fallback in the new account
        expect(result.current).toBe('shared query');
    });
});
