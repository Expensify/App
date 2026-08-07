import {act, renderHook} from '@testing-library/react-native';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

type NavigationListener = (event: {data: Record<string, unknown>}) => void;
type UseSingleExecution = () => {
    isExecuting: boolean;
    singleExecution: <T extends unknown[]>(action: (...params: T) => void | Promise<void>) => (...params: T) => void;
};

const mockNavigationRef = {
    currentRouteKey: 'route-a' as string | undefined,
    listeners: {} as Partial<Record<string, NavigationListener[]>>,
    isReady: () => true,
    getCurrentRoute: () => (mockNavigationRef.currentRouteKey ? {key: mockNavigationRef.currentRouteKey, name: 'Screen'} : undefined),
    getRootState: () => undefined,
    addListener: (event: string, listener: NavigationListener) => {
        mockNavigationRef.listeners[event] ??= [];
        mockNavigationRef.listeners[event]?.push(listener);
        return () => {
            mockNavigationRef.listeners[event] = mockNavigationRef.listeners[event]?.filter((cb) => cb !== listener);
        };
    },
};

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: mockNavigationRef,
}));

const {default: useSingleExecution} = jest.requireActual<{default: UseSingleExecution}>('@hooks/useSingleExecution');

describe('useSingleExecution (native)', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('clears isExecuting after a synchronous action when no transition is predicted', () => {
        const {result} = renderHook(() => useSingleExecution());
        const action = jest.fn();

        act(() => {
            result.current.singleExecution(action)();
        });

        expect(action).toHaveBeenCalledTimes(1);
        expect(result.current.isExecuting).toBe(true);

        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(result.current.isExecuting).toBe(false);
    });

    it('keeps isExecuting until an async action settles, then clears it', async () => {
        const {result} = renderHook(() => useSingleExecution());
        let resolveAction: () => void = () => {};
        const action = jest.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveAction = resolve;
                }),
        );

        act(() => {
            result.current.singleExecution(action)();
        });

        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(result.current.isExecuting).toBe(true);

        await act(async () => {
            resolveAction();
            await Promise.resolve();
        });

        expect(result.current.isExecuting).toBe(false);
    });

    it('ignores a second invocation while the first is still executing', () => {
        const {result} = renderHook(() => useSingleExecution());
        const action = jest.fn();

        act(() => {
            const run = result.current.singleExecution(action);
            run();
            run();
        });

        expect(action).toHaveBeenCalledTimes(1);
    });

    it('cancels the pending transition handle on unmount', () => {
        const cancelSpy = jest.fn();
        const runAfterTransitionsSpy = jest.spyOn(TransitionTracker, 'runAfterTransitions').mockReturnValue({cancel: cancelSpy});

        const {result, unmount} = renderHook(() => useSingleExecution());

        act(() => {
            result.current.singleExecution(jest.fn())();
            jest.advanceTimersByTime(0);
        });

        unmount();

        expect(cancelSpy).toHaveBeenCalledTimes(1);
        runAfterTransitionsSpy.mockRestore();
    });
});
