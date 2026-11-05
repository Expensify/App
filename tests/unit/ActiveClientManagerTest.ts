import type {Init, IsClientTheLeader, IsReady, OnBecomeLeader} from '@libs/ActiveClientManager/types';

type ActiveClientManagerModule = {
    init: Init;
    isClientTheLeader: IsClientTheLeader;
    isReady: IsReady;
    onBecomeLeader: OnBecomeLeader;
};

type LockRequest = {
    callback: LockGrantedCallback<unknown>;
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
};

const mockSetActiveClients = jest.fn<Promise<void>, [string[]]>(() => Promise.resolve());
const mockActiveClientsCallbacks: Array<(value: string[] | undefined) => void> = [];

jest.mock('@userActions/ActiveClients', () => ({
    setActiveClients: (activeClients: string[]) => mockSetActiveClients(activeClients),
}));

jest.mock('@libs/actions/Modal', () => ({
    setModalVisibility: jest.fn(),
}));

jest.mock('react-native-onyx', () => {
    const actual = jest.requireActual<{default: Record<string, unknown>}>('react-native-onyx');
    return {
        __esModule: true,
        ...actual,
        default: {
            ...actual.default,
            connectWithoutView: ({callback}: {callback: (value: string[] | undefined) => void}) => {
                mockActiveClientsCallbacks.push(callback);
                return 0;
            },
        },
    };
});

/**
 * A single-name, exclusive-mode stand-in for the browser's LockManager, shared by every simulated tab like the real one is shared by an origin's tabs.
 */
class FakeLockManager {
    private holder: LockRequest | undefined;

    private queue: LockRequest[] = [];

    request(name: string, options: LockOptions, callback: LockGrantedCallback<unknown>): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const lockRequest: LockRequest = {callback, resolve, reject};

            if (options.steal) {
                const stolenRequest = this.holder;
                this.holder = undefined;
                stolenRequest?.reject(new DOMException('Lock broken by another request with the steal option', 'AbortError'));
                this.grant(name, lockRequest);
                return;
            }

            options.signal?.addEventListener('abort', () => {
                if (!this.queue.includes(lockRequest)) {
                    return;
                }
                this.queue = this.queue.filter((queuedRequest) => queuedRequest !== lockRequest);
                reject(new DOMException('The request was aborted', 'AbortError'));
            });
            this.queue.push(lockRequest);
            this.grantNext(name);
        });
    }

    /** The browser releases a lock when the tab holding it closes or crashes, without settling anything in that tab */
    closeLeaderTab() {
        this.holder = undefined;
        this.grantNext('activeClientLeader');
    }

    private grantNext(name: string) {
        if (this.holder) {
            return;
        }
        const nextRequest = this.queue.shift();
        if (nextRequest) {
            this.grant(name, nextRequest);
        }
    }

    private grant(name: string, lockRequest: LockRequest) {
        this.holder = lockRequest;
        Promise.resolve()
            .then(() => lockRequest.callback({name, mode: 'exclusive'}))
            .then((value) => {
                if (this.holder !== lockRequest) {
                    return;
                }
                this.holder = undefined;
                lockRequest.resolve(value);
                this.grantNext(name);
            });
    }
}

const waitForLocks = () =>
    new Promise((resolve) => {
        setTimeout(resolve, 0);
    });

/** Each tab gets its own copy of the module, so its own clientID and leader state, like a separate page load */
function openTab(): ActiveClientManagerModule {
    let tab: ActiveClientManagerModule | undefined;
    jest.isolateModules(() => {
        // Jest defaults to the native platform, where the ActiveClientManager is a no-op, so we pin the web implementation.
        tab = jest.requireActual<ActiveClientManagerModule>('@libs/ActiveClientManager/index.ts');
    });
    if (!tab) {
        throw new Error('Failed to load the ActiveClientManager');
    }
    return tab;
}

const countLeaders = (tabs: ActiveClientManagerModule[]) => tabs.filter((tab) => tab.isClientTheLeader()).length;

describe('ActiveClientManager', () => {
    let lockManager: FakeLockManager;

    beforeEach(() => {
        lockManager = new FakeLockManager();
        Object.defineProperty(navigator, 'locks', {
            value: lockManager,
            configurable: true,
        });
        mockSetActiveClients.mockClear();
        mockActiveClientsCallbacks.length = 0;
    });

    afterEach(() => {
        Object.defineProperty(navigator, 'locks', {
            value: undefined,
            configurable: true,
        });
    });

    it('makes a single tab the leader even when a stale client ID is last in ACTIVE_CLIENTS', async () => {
        // Given a single open tab that has initialized
        const tab = openTab();
        tab.init();
        await tab.isReady();
        const clientID = mockSetActiveClients.mock.calls.at(-1)?.at(0)?.at(-1) ?? '';

        // When ACTIVE_CLIENTS ends with the ID of a tab that died without cleaning up
        for (const callback of mockActiveClientsCallbacks) {
            callback([clientID, 'webLock_ghost-client-from-a-dead-tab']);
        }

        // Then the tab is still the leader, because leadership comes from the lock and not from the order of ACTIVE_CLIENTS
        expect(tab.isClientTheLeader()).toBe(true);
    });

    it('steps aside while a tab from an older build leads, and takes over again on its next init', async () => {
        // Given a tab holding the lock
        const tab = openTab();
        tab.init();
        await tab.isReady();
        const clientID = mockSetActiveClients.mock.calls.at(-1)?.at(0)?.at(-1) ?? '';

        // When a tab from a build without Web Locks saves its ID last, which makes it the leader by its own rule
        for (const callback of mockActiveClientsCallbacks) {
            callback([clientID, 'older-build-client']);
        }

        // Then this tab steps aside, so the two builds never send the same queued request twice
        expect(tab.isClientTheLeader()).toBe(false);

        // When this tab is focused again and initializes
        tab.init();
        for (const callback of mockActiveClientsCallbacks) {
            callback(mockSetActiveClients.mock.calls.at(-1)?.at(0));
        }

        // Then it saves its ID last again, which hands leadership back from the older build tab
        expect(mockSetActiveClients).toHaveBeenLastCalledWith([clientID]);
        expect(tab.isClientTheLeader()).toBe(true);
    });

    it('makes the most recently opened tab the only leader', async () => {
        // Given two tabs that are already open, with the first one leading
        const firstTab = openTab();
        const secondTab = openTab();
        firstTab.init();
        await waitForLocks();

        // When the second tab initializes, as it does when it is opened or focused
        secondTab.init();
        await waitForLocks();

        // Then the newer tab takes over and the old one steps down, so the queue is only flushed once
        expect(firstTab.isClientTheLeader()).toBe(false);
        expect(secondTab.isClientTheLeader()).toBe(true);
    });

    it('keeps a single leader when many tabs initialize at the same time', async () => {
        // Given seven open tabs, like the sign-in case where each tab used to send its own RequestNewValidateCode
        const tabs = Array.from({length: 7}, openTab);

        // When every tab initializes at once, twice in a row
        for (const tab of [...tabs, ...tabs]) {
            tab.init();
        }
        await waitForLocks();

        // Then exactly one tab believes it is the leader
        expect(countLeaders(tabs)).toBe(1);
    });

    it('hands leadership to an open tab when the leader tab closes', async () => {
        // Given two tabs, where the second one leads
        const firstTab = openTab();
        const secondTab = openTab();
        firstTab.init();
        await waitForLocks();
        secondTab.init();
        await waitForLocks();

        // When the leader tab closes or crashes without running any cleanup
        lockManager.closeLeaderTab();
        await waitForLocks();

        // Then the tab that is still open becomes the leader instead of waiting forever
        expect(firstTab.isClientTheLeader()).toBe(true);
    });

    it('gives leadership back to a tab when it is focused again', async () => {
        // Given a tab that lost leadership to a newer tab
        const firstTab = openTab();
        const secondTab = openTab();
        firstTab.init();
        await waitForLocks();
        secondTab.init();
        await waitForLocks();

        // When the first tab is focused again and initializes
        firstTab.init();
        await waitForLocks();

        // Then it takes leadership back and the other tab steps down
        expect(firstTab.isClientTheLeader()).toBe(true);
        expect(secondTab.isClientTheLeader()).toBe(false);
    });

    it('tells listeners each time the tab becomes the leader, so the queue is flushed after the lock is granted', async () => {
        // Given two tabs where the second one leads, and the first one listens for becoming the leader like the Network does
        const firstTab = openTab();
        const secondTab = openTab();
        const onBecomeLeader = jest.fn();
        firstTab.onBecomeLeader(onBecomeLeader);
        firstTab.init();
        await waitForLocks();
        expect(onBecomeLeader).toHaveBeenCalledTimes(1);
        secondTab.init();
        await waitForLocks();

        // When the leader tab closes, so the waiting tab is granted the lock
        lockManager.closeLeaderTab();
        await waitForLocks();

        // Then the listener runs again, because a flush that ran while the tab was still waiting already gave up
        expect(onBecomeLeader).toHaveBeenCalledTimes(2);

        // When the tab is focused again while it already leads
        firstTab.init();
        await waitForLocks();

        // Then the listener doesn't run again, since leadership didn't change
        expect(onBecomeLeader).toHaveBeenCalledTimes(2);
    });

    it('falls back to the ACTIVE_CLIENTS list when Web Locks are not available', async () => {
        // Given a browser without Web Locks
        Object.defineProperty(navigator, 'locks', {
            value: undefined,
            configurable: true,
        });
        const tab = openTab();

        // When the tab initializes
        tab.init();
        await tab.isReady();

        // Then it saves its ID last in ACTIVE_CLIENTS and leads
        const clientID = mockSetActiveClients.mock.calls.at(-1)?.at(0)?.at(-1);
        expect(clientID).toBeDefined();
        expect(tab.isClientTheLeader()).toBe(true);
    });
});
