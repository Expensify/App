import {act, renderHook} from '@testing-library/react-native';
import useActionListContextValue from '@hooks/useActionListContextValue';
import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';

/**
 * `useActionListContextValue` owns a private holder and exposes `registerListRef(ref)` / `getListRef()`
 * plus the scroll refs so each list owns its ref locally while handlers resolve it at call time.
 */
describe('useActionListContextValue', () => {
    it('getListRef() returns null before any ref is registered', () => {
        const {result} = renderHook(() => useActionListContextValue());

        expect(result.current.getListRef()).toBeNull();
    });

    it('getListRef() returns the same ref object after registerListRef(ref)', () => {
        const {result} = renderHook(() => useActionListContextValue());
        const listRef: FlatListRefType = {current: null};

        act(() => {
            result.current.registerListRef(listRef);
        });

        expect(result.current.getListRef()).toBe(listRef);
    });

    it('getListRef() returns null again after registerListRef(null) (unmount path)', () => {
        const {result} = renderHook(() => useActionListContextValue());
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
        const {result, rerender} = renderHook(() => useActionListContextValue());

        const firstScrollPositionRef = result.current.scrollPositionRef;
        const firstScrollOffsetRef = result.current.scrollOffsetRef;

        expect(firstScrollPositionRef.current).toEqual({});
        expect(firstScrollOffsetRef.current).toBe(0);

        rerender({});

        expect(result.current.scrollPositionRef).toBe(firstScrollPositionRef);
        expect(result.current.scrollOffsetRef).toBe(firstScrollOffsetRef);
    });
});
