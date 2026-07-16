import runAfterPredictedTransition from '@libs/Navigation/runAfterPredictedTransition';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';

type NavigationListener = (event: {data: Record<string, unknown>}) => void;

const UNSAFE_ACTION_EVENT = '__unsafe_action__';
const navigationListeners: Partial<Record<string, NavigationListener[]>> = {};

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        addListener: (event: string, listener: NavigationListener) => {
            navigationListeners[event] ??= [];
            navigationListeners[event].push(listener);
            return () => {
                navigationListeners[event] = navigationListeners[event]?.filter((cb) => cb !== listener);
            };
        },
    },
}));

function createNavState(focusedRouteKey: string) {
    return {
        stale: false,
        type: 'stack',
        key: 'root',
        index: 0,
        routeNames: ['Screen'],
        routes: [{key: focusedRouteKey, name: 'Screen', params: {}}],
    };
}

function emitAction(type: string, noop = false): void {
    for (const listener of navigationListeners[UNSAFE_ACTION_EVENT] ?? []) {
        listener({data: {noop, action: {type}}});
    }
}

function emitState(focusedRouteKey: string): void {
    for (const listener of navigationListeners.state ?? []) {
        listener({data: {state: createNavState(focusedRouteKey)}});
    }
}

describe('runAfterPredictedTransition', () => {
    let runAfterTransitionsSpy: jest.SpiedFunction<typeof TransitionTracker.runAfterTransitions>;

    beforeEach(() => {
        jest.useFakeTimers();
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
        await Promise.resolve();
        await Promise.resolve();
        expect(callback).not.toHaveBeenCalled();

        TransitionTracker.endTransition(transitionHandle);
        expect(callback).toHaveBeenCalledTimes(1);
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
