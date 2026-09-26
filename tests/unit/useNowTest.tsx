import {act, renderHook} from '@testing-library/react-native';

import useNow from '@hooks/useNow';

import {resetForTests as resetNowStore, subscribe as subscribeToNow} from '@libs/NowStore';

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
        // Given a clock store with no subscribers yet
        // When the hook first renders
        const {result, unmount} = renderHook(() => useNow());

        // Then it already holds a Date, so a consumer never renders against an empty clock
        expect(result.current).toBeInstanceOf(Date);
        unmount();
    });

    it('re-renders subscribers when the wall-clock minute changes', () => {
        // Given a subscriber mounted at 10:30:00
        jest.setSystemTime(new Date('2026-05-24T10:30:00Z'));
        const {result, unmount} = renderHook(() => useNow());
        const initial = result.current;

        // When the clock passes the next minute boundary, which also fires the timer scheduled at subscribe time
        act(() => {
            jest.advanceTimersByTime(60_100);
        });

        // Then it re-renders with 10:31, because labels like "1 minute ago" are only as fresh as this tick
        expect(result.current).not.toBe(initial);
        expect(result.current.getUTCMinutes()).toBe(31);
        unmount();
    });

    it('re-renders after a 60-minute sleep/wake that lands on the same minute-of-hour', () => {
        // Given a subscriber mounted at 10:30
        jest.setSystemTime(new Date('2026-05-24T10:30:00Z'));
        const {result, unmount} = renderHook(() => useNow());
        const initial = result.current;

        // When an hour passes, as across a sleep and wake, so the minute-of-hour repeats
        act(() => {
            jest.advanceTimersByTime(3600_000);
        });

        // Then it still re-renders with 11:30, because the store compares a monotonic minute index rather than the minute-of-hour
        expect(result.current).not.toBe(initial);
        expect(result.current.getUTCHours()).toBe(11);
        unmount();
    });

    it('returns the same snapshot inside the same minute (no re-renders)', () => {
        // Given a subscriber mounted at 10:30:00
        jest.setSystemTime(new Date('2026-05-24T10:30:00Z'));
        const {result, unmount} = renderHook(() => useNow());
        const initial = result.current;

        // When the clock moves 45 seconds without the pending tick firing
        act(() => {
            jest.setSystemTime(new Date('2026-05-24T10:30:45Z'));
        });

        // Then the snapshot is the same object, so useSyncExternalStore does not re-render within a minute
        expect(result.current).toBe(initial);
        unmount();
    });

    it('notifies every subscriber on a single minute change', () => {
        // Given two subscribers mounted in the same minute
        jest.setSystemTime(new Date('2026-05-24T10:30:00Z'));
        const a = renderHook(() => useNow());
        const b = renderHook(() => useNow());

        // When the minute boundary passes
        act(() => {
            jest.advanceTimersByTime(60_100);
        });

        // Then both see 10:31 through one shared Date, so every clock on screen agrees
        expect(a.result.current.getUTCMinutes()).toBe(31);
        expect(b.result.current.getUTCMinutes()).toBe(31);
        expect(a.result.current).toBe(b.result.current);
        a.unmount();
        b.unmount();
    });

    it('renders the current minute on the first render after a gap with no subscribers', () => {
        // Given a subscriber that unmounted at 10:00, which stopped the timer, so nothing has advanced the stored minute since
        jest.setSystemTime(new Date('2026-05-24T10:00:00Z'));
        const first = renderHook(() => useNow());
        first.unmount();
        jest.setSystemTime(new Date('2026-05-24T11:37:00Z'));

        // When a new subscriber mounts at 11:37, capturing every render because `result.current` only shows the value after the subscribe effect corrected it
        const rendered: Date[] = [];
        const second = renderHook(() => {
            const now = useNow();
            rendered.push(now);
            return now;
        });

        // Then its first render already shows 11:37, since a 97-minute-old clock on that first paint is what a user would see
        expect(rendered.at(0)?.toISOString()).toBe('2026-05-24T11:37:00.000Z');
        second.unmount();
    });

    it('notifies the subscriber it is adding about the transition subscribing consumed', () => {
        // Given a listener already subscribed at 10:00, and a minute that passes before the pending tick fires, which is
        // what a busy JS thread or a wake from background leaves behind
        jest.setSystemTime(new Date('2026-05-24T10:00:00Z'));
        resetNowStore();
        const notified: string[] = [];
        const unsubscribeFirst = subscribeToNow(() => notified.push('first'));
        jest.setSystemTime(new Date('2026-05-24T10:01:00Z'));

        // When a second listener subscribes, which advances the clock because nothing else has
        const unsubscribeSecond = subscribeToNow(() => notified.push('second'));

        // Then both hear about it. Only React's own re-read after subscribing hides a listener left out here, and the
        // store cannot rely on that: the pending tick sees the same minute and notifies nobody
        expect(notified).toEqual(['first', 'second']);
        unsubscribeFirst();
        unsubscribeSecond();
    });

    it('clears the pending timer when the last subscriber unmounts', () => {
        // Given two subscribers sharing the store's one minute timer
        const clearSpy = jest.spyOn(globalThis, 'clearTimeout');
        const a = renderHook(() => useNow());
        const b = renderHook(() => useNow());

        // When the first one unmounts
        a.unmount();

        // Then the timer keeps running for the subscriber still mounted
        expect(clearSpy).not.toHaveBeenCalled();

        // When the last one unmounts
        b.unmount();

        // Then the timer is cleared, so nothing keeps waking the app with no clock on screen
        expect(clearSpy).toHaveBeenCalled();
        clearSpy.mockRestore();
    });
});
