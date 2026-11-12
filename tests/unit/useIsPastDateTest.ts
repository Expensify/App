import {act, renderHook} from '@testing-library/react-native';

import useIsPastDate from '@hooks/useIsPastDate';

import CONST from '@src/CONST';

const ONE_MINUTE_MS = 60 * 1000;

function getDateFromNow(offsetMs: number) {
    return new Date(Date.now() + offsetMs).toISOString();
}

describe('useIsPastDate', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns false until the date passes and true right after', () => {
        // Given a date one minute in the future
        const date = getDateFromNow(ONE_MINUTE_MS);
        const {result} = renderHook(() => useIsPastDate(date));
        expect(result.current).toBe(false);

        // When time moves to just before the date
        act(() => {
            jest.advanceTimersByTime(ONE_MINUTE_MS - 1000);
        });

        // Then it still reports the date as upcoming
        expect(result.current).toBe(false);

        // When time moves past the date without any other re-render trigger
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // Then it flips to true on its own, because the hook schedules a re-render for the moment the date passes
        expect(result.current).toBe(true);
    });

    it('resets to false when a passed date is replaced by a future one', () => {
        // Given a date that has already been reached while the hook is mounted
        const {result, rerender} = renderHook(({date}: {date: string}) => useIsPastDate(date), {initialProps: {date: getDateFromNow(ONE_MINUTE_MS)}});
        act(() => {
            jest.advanceTimersByTime(ONE_MINUTE_MS);
        });
        expect(result.current).toBe(true);

        // When the date is replaced by a new future one, like a call rescheduled after the previous one passed
        rerender({date: getDateFromNow(ONE_MINUTE_MS)});

        // Then it reports the new date as upcoming, because the passed state belongs to the old date only
        expect(result.current).toBe(false);

        // When the new date passes
        act(() => {
            jest.advanceTimersByTime(ONE_MINUTE_MS);
        });

        // Then it flips to true again
        expect(result.current).toBe(true);
    });

    it('returns true immediately for a date that already passed', () => {
        // Given a date one minute in the past
        const date = getDateFromNow(-ONE_MINUTE_MS);

        // When the hook renders
        const {result} = renderHook(() => useIsPastDate(date));

        // Then it reports the date as passed without waiting for a timer
        expect(result.current).toBe(true);
    });

    it('returns false when there is no date', () => {
        // Given no date
        // When the hook renders
        const {result} = renderHook(() => useIsPastDate(undefined));

        // Then it reports false, so callers treat a missing date as not passed
        expect(result.current).toBe(false);
    });

    it('flips at the date even when it is further away than the maximum setTimeout delay', () => {
        // Given a date beyond CONST.LIMIT_TIMEOUT, where a single setTimeout would overflow and fire immediately
        const date = getDateFromNow(CONST.LIMIT_TIMEOUT + ONE_MINUTE_MS);
        const {result} = renderHook(() => useIsPastDate(date));

        // When the first LIMIT_TIMEOUT step elapses
        act(() => {
            jest.advanceTimersByTime(CONST.LIMIT_TIMEOUT);
        });

        // Then it is still upcoming, because the hook re-arms instead of firing early
        expect(result.current).toBe(false);

        // When the remaining time elapses
        act(() => {
            jest.advanceTimersByTime(ONE_MINUTE_MS);
        });

        // Then it flips exactly at the date
        expect(result.current).toBe(true);
    });
});
