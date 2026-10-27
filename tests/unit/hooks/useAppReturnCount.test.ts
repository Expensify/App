import {act, renderHook} from '@testing-library/react-native';

import useAppReturnCount from '@hooks/useAppReturnCount';

import type {AppStateStatus} from 'react-native';

import {AppState} from 'react-native';

const mockedAddEventListener = jest.spyOn(AppState, 'addEventListener');

function emitAppState(nextAppState: AppStateStatus) {
    const callback = mockedAddEventListener.mock.calls.at(-1)?.[1];
    act(() => callback?.(nextAppState));
}

describe('useAppReturnCount', () => {
    beforeEach(() => {
        mockedAddEventListener.mockClear();
        mockedAddEventListener.mockImplementation(() => ({remove: jest.fn()}) as ReturnType<typeof AppState.addEventListener>);
    });

    it('starts at zero', () => {
        // Given a freshly mounted hook

        // When nothing has happened yet
        const {result} = renderHook(() => useAppReturnCount());

        // Then there is nothing to refresh for
        expect(result.current).toBe(0);
    });

    it('counts a return from the background', () => {
        // Given a mounted hook
        const {result} = renderHook(() => useAppReturnCount());

        // When the app is backgrounded and then reopened
        emitAppState('background');
        emitAppState('active');

        // Then that counts as one return
        expect(result.current).toBe(1);
    });

    it('ignores a transient interruption that never reached the background', () => {
        // Given a mounted hook
        const {result} = renderHook(() => useAppReturnCount());

        // When iOS reports `inactive` and then `active`, like Control Center or a permission dialog
        emitAppState('inactive');
        emitAppState('active');

        // Then the app never left, so nothing is refetched
        expect(result.current).toBe(0);
    });

    it('counts a background trip that passes through inactive', () => {
        // Given a mounted hook
        const {result} = renderHook(() => useAppReturnCount());

        // When the app follows the real iOS sequence for leaving and coming back
        emitAppState('inactive');
        emitAppState('background');
        emitAppState('inactive');
        emitAppState('active');

        // Then it is counted once, not once per transition
        expect(result.current).toBe(1);
    });

    it('counts each separate return', () => {
        // Given a mounted hook
        const {result} = renderHook(() => useAppReturnCount());

        // When the user leaves and comes back twice
        emitAppState('background');
        emitAppState('active');
        emitAppState('background');
        emitAppState('active');

        // Then both returns are reported, so a stale screen refreshes each time
        expect(result.current).toBe(2);
    });
});
