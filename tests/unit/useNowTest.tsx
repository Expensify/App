import {act, renderHook} from '@testing-library/react-native';
import useNow, {resetForTests} from '@hooks/useNow';

describe('useNow', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        // useNow keeps `snapshot` across cleanup (StrictMode fix), so reset module state explicitly between tests.
        resetForTests();
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

        act(() => {
            jest.setSystemTime(new Date('2026-05-24T10:31:00Z'));
            jest.advanceTimersByTime(1000);
        });

        expect(result.current).not.toBe(initial);
        expect(result.current.getMinutes()).toBe(31);
        unmount();
    });

    it('re-renders after a 60-minute sleep/wake that lands on the same minute-of-hour', () => {
        jest.setSystemTime(new Date('2026-05-24T10:30:00Z'));
        const {result, unmount} = renderHook(() => useNow());
        const initial = result.current;

        act(() => {
            jest.setSystemTime(new Date('2026-05-24T11:30:00Z'));
            jest.advanceTimersByTime(1000);
        });

        expect(result.current).not.toBe(initial);
        expect(result.current.getUTCHours()).toBe(11);
        unmount();
    });

    it('returns the same snapshot inside the same minute (no re-renders)', () => {
        jest.setSystemTime(new Date('2026-05-24T10:30:00Z'));
        const {result, unmount} = renderHook(() => useNow());
        const initial = result.current;

        act(() => {
            jest.setSystemTime(new Date('2026-05-24T10:30:30Z'));
            jest.advanceTimersByTime(1000);
            jest.setSystemTime(new Date('2026-05-24T10:30:45Z'));
            jest.advanceTimersByTime(1000);
        });

        expect(result.current).toBe(initial);
        unmount();
    });

    it('fans out a single minute change to multiple subscribers', () => {
        jest.setSystemTime(new Date('2026-05-24T10:30:00Z'));
        const a = renderHook(() => useNow());
        const b = renderHook(() => useNow());

        act(() => {
            jest.setSystemTime(new Date('2026-05-24T10:31:00Z'));
            jest.advanceTimersByTime(1000);
        });

        expect(a.result.current.getMinutes()).toBe(31);
        expect(b.result.current.getMinutes()).toBe(31);
        expect(a.result.current).toBe(b.result.current);
        a.unmount();
        b.unmount();
    });

    it('clears the interval when the last subscriber unmounts', () => {
        const clearSpy = jest.spyOn(globalThis, 'clearInterval');
        const a = renderHook(() => useNow());
        const b = renderHook(() => useNow());

        a.unmount();
        expect(clearSpy).not.toHaveBeenCalled();

        b.unmount();
        expect(clearSpy).toHaveBeenCalled();
        clearSpy.mockRestore();
    });
});
