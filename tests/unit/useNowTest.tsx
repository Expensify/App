import {act, renderHook} from '@testing-library/react-native';

import useNow from '@hooks/useNow';

import {resetForTests as resetNowStore} from '@libs/NowStore';

describe('useNow', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        // Reset the module, else a leftover `lastMinute` masks a stale snapshot in the next test.
        resetNowStore();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('returns a Date on first render', () => {
        const {result, unmount} = renderHook(() => useNow());

        expect(result.current).toBeInstanceOf(Date);
        unmount();
    });

    it('re-renders subscribers when the wall-clock minute changes', () => {
        jest.setSystemTime(new Date('2026-05-24T10:30:00Z'));
        const {result, unmount} = renderHook(() => useNow());
        const initial = result.current;

        // Past the next minute boundary, which also fires the timer scheduled at subscribe time.
        act(() => {
            jest.advanceTimersByTime(60_100);
        });

        expect(result.current).not.toBe(initial);
        expect(result.current.getUTCMinutes()).toBe(31);
        unmount();
    });

    it('re-renders after a 60-minute sleep/wake that lands on the same minute-of-hour', () => {
        jest.setSystemTime(new Date('2026-05-24T10:30:00Z'));
        const {result, unmount} = renderHook(() => useNow());
        const initial = result.current;

        // An hour, so the minute-of-hour repeats but the monotonic minute index still changes.
        act(() => {
            jest.advanceTimersByTime(3600_000);
        });

        expect(result.current).not.toBe(initial);
        expect(result.current.getUTCHours()).toBe(11);
        unmount();
    });

    it('returns the same snapshot inside the same minute (no re-renders)', () => {
        jest.setSystemTime(new Date('2026-05-24T10:30:00Z'));
        const {result, unmount} = renderHook(() => useNow());
        const initial = result.current;

        // Advance the clock without firing the pending timer, so the subscriber keeps its cached snapshot.
        act(() => {
            jest.setSystemTime(new Date('2026-05-24T10:30:45Z'));
        });

        expect(result.current).toBe(initial);
        unmount();
    });

    it('notifies every subscriber on a single minute change', () => {
        jest.setSystemTime(new Date('2026-05-24T10:30:00Z'));
        const a = renderHook(() => useNow());
        const b = renderHook(() => useNow());

        act(() => {
            jest.advanceTimersByTime(60_100);
        });

        expect(a.result.current.getUTCMinutes()).toBe(31);
        expect(b.result.current.getUTCMinutes()).toBe(31);
        expect(a.result.current).toBe(b.result.current);
        a.unmount();
        b.unmount();
    });

    it('clears the pending timer when the last subscriber unmounts', () => {
        const clearSpy = jest.spyOn(globalThis, 'clearTimeout');
        const a = renderHook(() => useNow());
        const b = renderHook(() => useNow());

        a.unmount();
        expect(clearSpy).not.toHaveBeenCalled();

        b.unmount();
        expect(clearSpy).toHaveBeenCalled();
        clearSpy.mockRestore();
    });
});
