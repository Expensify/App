import type {NavigationState} from '@react-navigation/native';

type MemoryHistory = {
    get: (index: number) => {id: string} | undefined;
    replace: (options: {path: string; state: NavigationState}) => void;
    push: (options: {path: string; state: NavigationState}) => void;
    go: (distance: number) => Promise<void> | undefined;
    listen: (listener: () => void) => () => void;
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
        // Given a history with two entries and an external popstate listener
        const history = createHistoryWithTwoEntries();
        const listener = jest.fn();
        const stopListening = history.listen(listener);

        // When the traversal back lands just before the fallback timeout, as Firefox does under load
        const navigation = history.go(-1);
        jest.advanceTimersByTime(900);
        window.history.replaceState({id: history.get(0)?.id}, '', '/r/1');
        window.dispatchEvent(new PopStateEvent('popstate'));

        // Then the traversal resolves and its popstate is not treated as a user navigation

        await expect(navigation).resolves.toBeUndefined();
        expect(listener).not.toHaveBeenCalled();

        stopListening();
    });

    it('cleans up a timed-out traversal so a later external popstate is delivered', async () => {
        // Given a history with two entries and an external popstate listener
        const history = createHistoryWithTwoEntries();
        const listener = jest.fn();
        const stopListening = history.listen(listener);
        const settled = jest.fn();

        // When the traversal never lands in the browser
        const navigation = history.go(-1);
        navigation?.then(settled, settled);

        // Then it stays pending until the fallback timeout, and is rejected once the timeout passes without landing
        jest.advanceTimersByTime(999);
        await Promise.resolve();
        expect(settled).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        await expect(navigation).rejects.toThrow('History was changed during navigation.');
        expect(settled).toHaveBeenCalledTimes(1);

        // Then a later popstate is delivered to external listeners
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(listener).toHaveBeenCalledTimes(1);

        stopListening();
    });
});
