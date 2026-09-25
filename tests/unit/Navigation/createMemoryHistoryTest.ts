import type {NavigationState} from '@react-navigation/native';

type MemoryHistory = {
    replace: (options: {path: string; state: NavigationState}) => void;
    push: (options: {path: string; state: NavigationState}) => void;
    go: (distance: number) => Promise<void> | undefined;
    listen: (listener: () => void) => () => void;
    // Exposed by our `initial` patch on @react-navigation/native
    items: Array<{path: string; state: NavigationState; id: string}>;
};

const {
    createMemoryHistory,
}: {
    createMemoryHistory: () => MemoryHistory;
} = jest.requireActual('../../../node_modules/@react-navigation/native/lib/module/createMemoryHistory.js');

const state: NavigationState = {
    key: 'stack',
    index: 0,
    routeNames: ['Report'],
    routes: [{key: 'report', name: 'Report'}],
    stale: false,
    type: 'stack',
};

function createHistoryWithTwoEntries() {
    const history = createMemoryHistory();
    history.replace({path: '/r/1', state});
    history.push({path: '/r/2', state});
    return history;
}

describe('createMemoryHistory', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        window.history.replaceState(null, '', '/');
        jest.spyOn(window.history, 'go').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('keeps a delayed internal popstate from being delivered to external listeners', async () => {
        const history = createHistoryWithTwoEntries();
        const listener = jest.fn();
        const stopListening = history.listen(listener);

        const navigation = history.go(-1);
        // `history.go` is mocked, so nothing moves the browser entry on its own. Point the browser
        // state at the entry we asked to land on, the way a real traversal would, otherwise the
        // library treats the traversal as failed (see `targetId` in createMemoryHistory).
        window.history.replaceState({id: history.items.at(0)?.id}, '', '/r/1');
        jest.advanceTimersByTime(900);
        window.dispatchEvent(new PopStateEvent('popstate'));

        await expect(navigation).resolves.toBeUndefined();
        expect(listener).not.toHaveBeenCalled();

        stopListening();
    });

    it('cleans up a timed-out traversal so a later external popstate is delivered', async () => {
        const history = createHistoryWithTwoEntries();
        const listener = jest.fn();
        const stopListening = history.listen(listener);
        const resolved = jest.fn();
        const rejected = jest.fn();

        const navigation = history.go(-1);
        navigation?.then(resolved, rejected);

        jest.advanceTimersByTime(999);
        await Promise.resolve();
        expect(resolved).not.toHaveBeenCalled();
        expect(rejected).not.toHaveBeenCalled();

        // The traversal never happened, so the library reports it as a failed navigation instead of
        // pretending it succeeded. That is intentional: resolving here would let callers write history
        // for an entry the browser never landed on.
        jest.advanceTimersByTime(1);
        await expect(navigation).rejects.toThrow('History was changed during navigation.');
        expect(resolved).not.toHaveBeenCalled();
        expect(rejected).toHaveBeenCalledTimes(1);

        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(listener).toHaveBeenCalledTimes(1);

        stopListening();
    });
});
