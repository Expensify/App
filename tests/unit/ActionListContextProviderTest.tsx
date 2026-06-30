import {act, renderHook} from '@testing-library/react-native';
import type FlatListRefType from '@components/FlashList/types';
import {ActionListContextProvider, useActionListContext} from '@pages/inbox/ActionListContext';

/**
 * `ActionListContextProvider` owns a private holder and exposes `registerListRef(ref)` / `getListRef()`
 * plus the scroll refs so each list owns its ref locally while handlers resolve it at call time.
 * The tests exercise the public surface (the provider + the `useActionListContext` consumer hook).
 */
describe('ActionListContextProvider', () => {
    it('getListRef() returns null before any ref is registered', () => {
        const {result} = renderHook(() => useActionListContext(), {wrapper: ActionListContextProvider});

        expect(result.current.getListRef()).toBeNull();
    });

    it('getListRef() returns the same ref object after registerListRef(ref)', () => {
        const {result} = renderHook(() => useActionListContext(), {wrapper: ActionListContextProvider});
        const listRef: FlatListRefType = {current: null};

        act(() => {
            result.current.registerListRef(listRef);
        });

        expect(result.current.getListRef()).toBe(listRef);
    });

    it('getListRef() returns null again after registerListRef(null) (unmount path)', () => {
        const {result} = renderHook(() => useActionListContext(), {wrapper: ActionListContextProvider});
        const listRef: FlatListRefType = {current: null};

        act(() => {
            result.current.registerListRef(listRef);
        });
        expect(result.current.getListRef()).toBe(listRef);

        act(() => {
            result.current.registerListRef(null);
        });

        expect(result.current.getListRef()).toBeNull();
    });

    it('keeps scrollPositionRef / scrollOffsetRef stable across re-renders with their initial values', () => {
        const {result, rerender} = renderHook(() => useActionListContext(), {wrapper: ActionListContextProvider});

        const firstScrollPositionRef = result.current.scrollPositionRef;
        const firstScrollOffsetRef = result.current.scrollOffsetRef;

        expect(firstScrollPositionRef.current).toEqual({});
        expect(firstScrollOffsetRef.current).toBe(0);

        rerender({});

        expect(result.current.scrollPositionRef).toBe(firstScrollPositionRef);
        expect(result.current.scrollOffsetRef).toBe(firstScrollOffsetRef);
    });
});
