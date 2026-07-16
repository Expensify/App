import type {NavigationState} from '@react-navigation/native';

type MemoryHistory = {
    replace: (options: {path: string; state: NavigationState}) => void;
    push: (options: {path: string; state: NavigationState}) => void;
    go: (distance: number) => Promise<void> | undefined;
    listen: (listener: () => void) => () => void;
};

const {createMemoryHistory} = jest.requireActual('../../../node_modules/@react-navigation/native/lib/module/createMemoryHistory.js') as {
    createMemoryHistory: () => MemoryHistory;
};

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
        const unlisten = history.listen(listener);

        const navigation = history.go(-1);
        jest.advanceTimersByTime(900);
        window.dispatchEvent(new PopStateEvent('popstate'));

        await expect(navigation).resolves.toBeUndefined();
        expect(listener).not.toHaveBeenCalled();

        unlisten();
    });

    it('cleans up a timed-out traversal so a later external popstate is delivered', async () => {
        const history = createHistoryWithTwoEntries();
        const listener = jest.fn();
        const unlisten = history.listen(listener);
        const resolved = jest.fn();

        const navigation = history.go(-1);
        navigation?.then(resolved);

        jest.advanceTimersByTime(999);
        await Promise.resolve();
        expect(resolved).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        await expect(navigation).resolves.toBeUndefined();
        expect(resolved).toHaveBeenCalledTimes(1);

        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(listener).toHaveBeenCalledTimes(1);

        unlisten();
    });
});
