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

    /** Safari rejects the holder's promise when its page is suspended. */
    suspendLeaderTab() {
        const suspendedRequest = this.holder;
        this.holder = undefined;
        suspendedRequest?.reject(new DOMException('The browsing context is going away', 'AbortError'));
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
    let requestSpy: jest.SpiedFunction<FakeLockManager['request']>;
    let addEventListenerSpy: jest.SpiedFunction<typeof window.addEventListener>;
    let visibilitySpy: jest.SpiedGetter<DocumentVisibilityState>;

    beforeEach(() => {
        lockManager = new FakeLockManager();
        requestSpy = jest.spyOn(lockManager, 'request');
        addEventListenerSpy = jest.spyOn(window, 'addEventListener');
        visibilitySpy = jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
        Object.defineProperty(navigator, 'locks', {
            value: lockManager,
            configurable: true,
        });
        mockSetActiveClients.mockClear();
        mockActiveClientsCallbacks.length = 0;
    });

    afterEach(() => {
        // Each simulated tab shares jsdom's window, so its listeners must not run in later tests.
        for (const [type, listener] of addEventListenerSpy.mock.calls) {
            if (type === 'pageshow' || type === 'beforeunload') {
                window.removeEventListener(type, listener);
            }
        }
        addEventListenerSpy.mockRestore();
        requestSpy.mockRestore();
        visibilitySpy.mockRestore();
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

    it.each(['InvalidStateError', 'SecurityError', 'AbortError'])('does not immediately retry a failed acquisition with %s', async (errorName) => {
        // Given a browser that rejects lock acquisitions, with a finite mock so a regression cannot hang Jest.
        const error = new DOMException('The lock cannot be acquired', errorName);
        requestSpy.mockRejectedValueOnce(error).mockRejectedValueOnce(error);
        const tab = openTab();
        const onBecomeLeader = jest.fn();
        const onReady = jest.fn();
        tab.onBecomeLeader(onBecomeLeader);
        tab.isReady().then(onReady);

        // When acquiring the lock fails before the tab has held it.
        tab.init();
        await waitForLocks();

        // Then the event loop can run without retries or falsely granting permission to send requests.
        expect(requestSpy).toHaveBeenCalledTimes(1);
        expect(tab.isClientTheLeader()).toBe(false);
        expect(mockSetActiveClients).not.toHaveBeenCalled();
        expect(onBecomeLeader).not.toHaveBeenCalled();
        expect(onReady).not.toHaveBeenCalled();
    });

    it('can acquire leadership on focus after its initial lock request failed', async () => {
        // Given a tab whose first acquisition failed while its document was inactive.
        requestSpy.mockRejectedValueOnce(new DOMException('The document is not fully active', 'InvalidStateError'));
        const tab = openTab();
        tab.init();
        await waitForLocks();
        expect(tab.isClientTheLeader()).toBe(false);

        // When the app initializes the client again after returning to the foreground.
        tab.init();
        await waitForLocks();

        // Then the failed attempt does not leave initialization blocked.
        expect(requestSpy).toHaveBeenCalledTimes(2);
        expect(tab.isClientTheLeader()).toBe(true);
        await expect(tab.isReady()).resolves.toBeUndefined();
    });

    it('does not claim leadership without a lock when another tab still leads', async () => {
        // Given a healthy leader and a second tab whose lock acquisition is rejected.
        const firstTab = openTab();
        const secondTab = openTab();
        firstTab.init();
        await waitForLocks();
        requestSpy.mockRejectedValueOnce(new DOMException('The document is not fully active', 'InvalidStateError'));

        // When the second tab tries to initialize.
        secondTab.init();
        await waitForLocks();

        // Then only the lock holder can send the shared request queue.
        expect(requestSpy).toHaveBeenCalledTimes(2);
        expect(firstTab.isClientTheLeader()).toBe(true);
        expect(secondTab.isClientTheLeader()).toBe(false);
        expect(mockSetActiveClients).toHaveBeenCalledTimes(1);
    });

    it('stops retrying when Safari suspends the leader and rejects its next acquisition', async () => {
        // Given a leader whose document will reject new lock requests during suspension.
        const tab = openTab();
        tab.init();
        await waitForLocks();
        expect(tab.isClientTheLeader()).toBe(true);
        const error = new DOMException('The document is not fully active', 'InvalidStateError');
        requestSpy.mockRejectedValueOnce(error).mockRejectedValueOnce(error);

        // When Safari releases the lock and rejects the attempt to wait for leadership again.
        lockManager.suspendLeaderTab();
        await waitForLocks();

        // Then the tab stops after the failed acquisition rather than blocking input with endless rejections.
        expect(requestSpy).toHaveBeenCalledTimes(2);
        expect(tab.isClientTheLeader()).toBe(false);
    });

    it('reacquires leadership when a suspended page is restored from the back/forward cache', async () => {
        // Given a suspended leader whose failed acquisition must wait for its document to become active.
        const tab = openTab();
        const onBecomeLeader = jest.fn();
        tab.onBecomeLeader(onBecomeLeader);
        tab.init();
        await waitForLocks();
        requestSpy.mockRejectedValueOnce(new DOMException('The document is not fully active', 'InvalidStateError'));
        lockManager.suspendLeaderTab();
        await waitForLocks();
        expect(tab.isClientTheLeader()).toBe(false);

        // When Back restores the page without necessarily changing its visibility.
        window.dispatchEvent(new PageTransitionEvent('pageshow', {persisted: true}));
        await waitForLocks();

        // Then the client can send queued work again and listeners hear about the new leadership.
        expect(requestSpy).toHaveBeenCalledTimes(3);
        expect(tab.isClientTheLeader()).toBe(true);
        expect(onBecomeLeader).toHaveBeenCalledTimes(2);

        // When initialization or pageshow repeats while this tab already leads.
        tab.init();
        window.dispatchEvent(new PageTransitionEvent('pageshow', {persisted: true}));
        await waitForLocks();

        // Then no extra lock or restore listener is needed.
        expect(requestSpy).toHaveBeenCalledTimes(3);
        expect(onBecomeLeader).toHaveBeenCalledTimes(2);
        expect(addEventListenerSpy.mock.calls.filter(([type]) => type === 'pageshow')).toHaveLength(1);
    });

    it.each([
        {persisted: false, visibility: 'visible' as const},
        {persisted: true, visibility: 'hidden' as const},
    ])('does not retry on pageshow with persisted=$persisted and visibility=$visibility', async ({persisted, visibility}) => {
        // Given an acquisition failure that should wait until a visible page is restored or focused.
        requestSpy.mockRejectedValueOnce(new DOMException('The document is not fully active', 'InvalidStateError'));
        const tab = openTab();
        tab.init();
        await waitForLocks();
        visibilitySpy.mockReturnValue(visibility);

        // When a normal page load or a hidden page restore emits pageshow.
        window.dispatchEvent(new PageTransitionEvent('pageshow', {persisted}));
        await waitForLocks();

        // Then a hidden or newly loading page does not make another request or steal leadership.
        expect(requestSpy).toHaveBeenCalledTimes(1);
        expect(tab.isClientTheLeader()).toBe(false);
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
