import {act, renderHook} from '@testing-library/react-native';

import {ActionListContextProvider, useActionListContext, useActionListReady, useActionListRef} from '@pages/inbox/ActionListContext';
import type ActionListRefType from '@pages/inbox/ActionListTypes';

function TestList() {
    useActionListRef();
    return null;
}

/**
 * `ActionListContextProvider` owns a private holder and exposes `registerListRef(ref)` / `getListRef()`
 * plus the scroll refs so each list owns its ref locally while handlers resolve it at call time.
 * The tests exercise the public surface (the provider + the `useActionListContext` consumer hook).
 */
describe('ActionListContextProvider', () => {
    it('resets readiness when the positioned list is replaced', () => {
        // Given a mounted report whose list has finished its initial positioning.
        let listKey = 'first';
        const {result, rerender} = renderHook(() => useActionListReady(), {
            wrapper: ({children}) => (
                <ActionListContextProvider>
                    {children}
                    <TestList key={listKey} />
                </ActionListContextProvider>
            ),
        });
        act(() => result.current.setIsReady(true));
        expect(result.current.isReady).toBe(true);

        // When another list registers with the same provider, it needs its own initial layout.
        listKey = 'second';
        rerender({});

        // Then the new list starts covered and publishes its ref before any scroll handler runs.
        expect(result.current.isReady).toBe(false);
    });

    it('getListRef() returns null before any ref is registered', () => {
        const {result} = renderHook(() => useActionListContext(), {wrapper: ActionListContextProvider});

        expect(result.current.getListRef()).toBeNull();
    });

    it('getListRef() returns the same ref object after registerListRef(ref)', () => {
        const {result} = renderHook(() => useActionListContext(), {wrapper: ActionListContextProvider});
        const listRef: ActionListRefType = {current: null};

        act(() => {
            result.current.registerListRef(listRef);
        });

        expect(result.current.getListRef()).toBe(listRef);
    });

    it('getListRef() returns null again after registerListRef(null) (unmount path)', () => {
        const {result} = renderHook(() => useActionListContext(), {wrapper: ActionListContextProvider});
        const listRef: ActionListRefType = {current: null};

        act(() => {
            result.current.registerListRef(listRef);
        });
        expect(result.current.getListRef()).toBe(listRef);

        act(() => {
            result.current.registerListRef(null);
        });

        expect(result.current.getListRef()).toBeNull();
    });

    it('keeps scrollOffsetRef stable across re-renders with its initial value', () => {
        const {result, rerender} = renderHook(() => useActionListContext(), {wrapper: ActionListContextProvider});

        const firstScrollOffsetRef = result.current.scrollOffsetRef;

        expect(firstScrollOffsetRef.current).toBe(0);

        rerender({});

        expect(result.current.scrollOffsetRef).toBe(firstScrollOffsetRef);
    });
});
