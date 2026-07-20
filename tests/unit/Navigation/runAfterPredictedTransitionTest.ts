import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {CancelHandle} from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';

type NavigationListener = (event: {data: Record<string, unknown>}) => void;
type RunAfterPredictedTransitionModule = {
    default: (callback: () => void | Promise<void>) => CancelHandle;
};

const UNSAFE_ACTION_EVENT = '__unsafe_action__';

const mockNavigationRef = {
    currentRouteKey: undefined as string | undefined,
    listeners: {} as Partial<Record<string, NavigationListener[]>>,
    isReady: () => true,
    getCurrentRoute: () => (mockNavigationRef.currentRouteKey ? {key: mockNavigationRef.currentRouteKey, name: 'Screen'} : undefined),
    getRootState: () =>
        mockNavigationRef.currentRouteKey
            ? {
                  stale: false,
                  type: 'stack',
                  key: 'root',
                  index: 0,
                  routeNames: ['Screen'],
                  routes: [{key: mockNavigationRef.currentRouteKey, name: 'Screen', params: {}}],
              }
            : undefined,
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

// Load after the mock object exists - module side effects register navigation listeners.
const {default: runAfterPredictedTransition} = jest.requireActual<RunAfterPredictedTransitionModule>('@libs/Navigation/runAfterPredictedTransition');

function emitAction(type: string, noop = false): void {
    for (const listener of mockNavigationRef.listeners[UNSAFE_ACTION_EVENT] ?? []) {
        listener({data: {noop, action: {type}}});
    }
}

function emitState(focusedRouteKey: string | undefined): void {
    mockNavigationRef.currentRouteKey = focusedRouteKey;
    for (const listener of mockNavigationRef.listeners.state ?? []) {
        // Event payload may be partial (keys omitted), the helper must use the hydrated ref instead.
        listener({
            data: {
                state: {
                    stale: true,
                    routes: [{name: 'Screen'}],
                    index: 0,
                },
            },
        });
    }
}

describe('runAfterPredictedTransition', () => {
    let runAfterTransitionsSpy: jest.SpiedFunction<typeof TransitionTracker.runAfterTransitions>;

    beforeEach(() => {
        jest.useFakeTimers();
        mockNavigationRef.currentRouteKey = undefined;
        runAfterTransitionsSpy = jest.spyOn(TransitionTracker, 'runAfterTransitions');
        resetPredictionModuleState();
    });

    afterEach(() => {
        runAfterTransitionsSpy.mockRestore();
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    function resetPredictionModuleState(): void {
        jest.advanceTimersByTime(Math.max(CONST.NAVIGATION_PREDICTION_WINDOW_MS, CONST.MAX_TRANSITION_START_WAIT_MS, CONST.MAX_TRANSITION_DURATION_MS));
        emitState('reset-route');
        const transitionHandle = TransitionTracker.startTransition();
        TransitionTracker.endTransition(transitionHandle);
        jest.advanceTimersByTime(CONST.MAX_TRANSITION_DURATION_MS);
    }

    function flushPredictionTick(): void {
        jest.advanceTimersByTime(0);
    }

    it('runs the callback immediately when no navigation action was dispatched', () => {
        const callback = jest.fn();
        runAfterPredictedTransition(callback);
        flushPredictionTick();

        expect(runAfterTransitionsSpy).toHaveBeenCalledWith(expect.objectContaining({callback, waitForUpcomingTransition: false}));
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('waits for an upcoming transition when an action is followed by a focus change', async () => {
        emitState('route-a');
        emitAction('NAVIGATE');
        emitState('route-b');

        const callback = jest.fn();
        runAfterPredictedTransition(callback);
        flushPredictionTick();

        expect(runAfterTransitionsSpy).toHaveBeenCalledWith(expect.objectContaining({callback, waitForUpcomingTransition: true}));
        expect(callback).not.toHaveBeenCalled();

        const transitionHandle = TransitionTracker.startTransition();
        // Two ticks: one for promiseForNextTransitionStart, one for Promise.race wrapper
        await Promise.resolve();
        await Promise.resolve();
        expect(callback).not.toHaveBeenCalled();

        TransitionTracker.endTransition(transitionHandle);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not treat a missing hydrated route key as an unchanged focus', () => {
        emitState('route-a');
        emitAction('NAVIGATE');
        emitState(undefined);

        const callback = jest.fn();
        runAfterPredictedTransition(callback);
        flushPredictionTick();

        expect(callback).not.toHaveBeenCalled();

        emitState('route-b');
        flushPredictionTick();

        expect(runAfterTransitionsSpy).toHaveBeenCalledWith(expect.objectContaining({callback, waitForUpcomingTransition: true}));
    });

    it('does not wait when an action does not change the focused route', () => {
        emitState('route-a');
        emitAction('NAVIGATE');
        emitState('route-a');

        const callback = jest.fn();
        runAfterPredictedTransition(callback);
        flushPredictionTick();

        expect(runAfterTransitionsSpy).toHaveBeenCalledWith(expect.objectContaining({callback, waitForUpcomingTransition: false}));
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it.each(['SET_PARAMS', 'REPLACE_PARAMS', 'PRELOAD', 'JUMP_TO'])('ignores %s actions', (actionType) => {
        emitState('route-a');
        emitAction(actionType);

        const callback = jest.fn();
        runAfterPredictedTransition(callback);
        flushPredictionTick();

        expect(runAfterTransitionsSpy).toHaveBeenCalledWith(expect.objectContaining({callback, waitForUpcomingTransition: false}));
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('clears prediction when a real transition starts before the prediction tick', () => {
        emitState('route-a');
        emitAction('NAVIGATE');
        emitState('route-b');

        const transitionHandle = TransitionTracker.startTransition();

        const callback = jest.fn();
        runAfterPredictedTransition(callback);
        flushPredictionTick();

        expect(runAfterTransitionsSpy).toHaveBeenCalledWith(expect.objectContaining({callback, waitForUpcomingTransition: false}));
        expect(callback).not.toHaveBeenCalled();

        TransitionTracker.endTransition(transitionHandle);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('stops waiting after the prediction window expires without a focus change', () => {
        emitAction('NAVIGATE');

        const callback = jest.fn();
        runAfterPredictedTransition(callback);
        flushPredictionTick();

        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(CONST.NAVIGATION_PREDICTION_WINDOW_MS);
        flushPredictionTick();

        expect(runAfterTransitionsSpy).toHaveBeenCalledWith(expect.objectContaining({callback, waitForUpcomingTransition: false}));
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('confirms a focus move on prediction-window expiry when the hydrated ref already changed (delayed state event)', async () => {
        // React Navigation updates its sync store during dispatch, but the container `state` event
        // only fires from useEffect after commit - on a jammed JS thread the effect can lag the
        // prediction-window timer. The timer must re-check getCurrentRoute before clearing.
        emitState('route-a');
        emitAction('NAVIGATE');
        mockNavigationRef.currentRouteKey = 'route-b';

        const callback = jest.fn();
        runAfterPredictedTransition(callback);
        flushPredictionTick();

        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(CONST.NAVIGATION_PREDICTION_WINDOW_MS);
        flushPredictionTick();

        expect(runAfterTransitionsSpy).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
        expect(callback).not.toHaveBeenCalled();

        const transitionHandle = TransitionTracker.startTransition();
        // Two ticks: one for promiseForNextTransitionStart, one for Promise.race wrapper
        await Promise.resolve();
        await Promise.resolve();
        TransitionTracker.endTransition(transitionHandle);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('runs the callback after the fallback timeout when a confirmed focus move never gets a real transitionStart', async () => {
        emitState('route-a');
        emitAction('NAVIGATE');
        emitState('route-b');

        const callback = jest.fn();
        runAfterPredictedTransition(callback);
        flushPredictionTick();

        expect(runAfterTransitionsSpy).toHaveBeenCalledWith(expect.objectContaining({callback, waitForUpcomingTransition: true}));
        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(CONST.MAX_TRANSITION_START_WAIT_MS);
        // Two ticks: one for the race against promiseForNextTransitionStart, one for the wrapper.
        await Promise.resolve();
        await Promise.resolve();

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('cancel before the prediction tick prevents the callback from running', () => {
        emitAction('NAVIGATE');
        emitState('route-b');

        const callback = jest.fn();
        const cancelHandle = runAfterPredictedTransition(callback);
        cancelHandle.cancel();
        flushPredictionTick();

        expect(callback).not.toHaveBeenCalled();
    });

    it('cancel after registering with TransitionTracker prevents the callback from running', () => {
        emitState('route-a');
        emitAction('NAVIGATE');
        emitState('route-b');

        const callback = jest.fn();
        const cancelHandle = runAfterPredictedTransition(callback);
        flushPredictionTick();

        cancelHandle.cancel();
        const transitionHandle = TransitionTracker.startTransition();
        TransitionTracker.endTransition(transitionHandle);

        expect(callback).not.toHaveBeenCalled();
    });
});
