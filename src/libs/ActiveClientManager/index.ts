import {setModalVisibility} from '@libs/actions/Modal';

import {setActiveClients} from '@userActions/ActiveClients';

import ONYXKEYS from '@src/ONYXKEYS';

/**
 * When you have many tabs in one browser, the data of Onyx is shared between all of them. Since we persist write requests in Onyx, we need to ensure that
 * only one tab is processing those saved requests or we would be duplicating data (or creating errors).
 * The leader is the tab holding the LEADER_LOCK_NAME Web Lock. Each init() steals it, so the most recently opened or focused tab leads, and the browser
 * releases it when the tab closes or crashes, so a dead tab can't keep leadership. Without Web Locks, we fall back to tracking all the clientIDs
 * connected, storing the most recent one last and considering that last clientID the "leader".
 */
import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';

import type {Init, IsClientTheLeader, IsReady, OnBecomeLeader} from './types';

const LEADER_LOCK_NAME = 'activeClientLeader';

// Builds from before Web Locks pick the leader from ACTIVE_CLIENTS alone. The prefix lets us tell their IDs apart while both builds are open.
const WEB_LOCK_CLIENT_ID_PREFIX = 'webLock_';
const clientID = `${WEB_LOCK_CLIENT_ID_PREFIX}${Str.guid()}`;
const maxClients = 20;
let activeClients: string[] = [];
let resolveSavedSelfPromise: () => void;
const savedSelfPromise = new Promise<void>((resolve) => {
    resolveSavedSelfPromise = resolve;
});
let beforeunloadListenerAdded = false;

const canUseWebLocks = () => typeof navigator !== 'undefined' && !!navigator.locks;

/**
 * Determines when the client is ready. We need to wait both till we saved our ID in onyx AND the init method was called
 */
const isReady: IsReady = () => savedSelfPromise;

let isHoldingLeaderLock = false;
let isStealingLeaderLock = false;
let leaderLockRequestID = 0;
let waitForLeaderLockController: AbortController | undefined;

let isPromotingNewLeader = false;

/**
 * The last GUID is the most recent GUID, so that should be the leader
 */
const isClientTheLeader: IsClientTheLeader = () => {
    if (canUseWebLocks()) {
        // A tab from an older build that saved its ID last believes it leads, so we step aside to keep a single leader
        const lastActiveClient = activeClients.at(-1);
        const isOlderBuildLeading = !!lastActiveClient && !lastActiveClient.startsWith(WEB_LOCK_CLIENT_ID_PREFIX);
        return isHoldingLeaderLock && !isOlderBuildLeading;
    }

    /**
     * When a new leader is being promoted, there is a brief period during which the current leader's clientID
     * is removed from the activeClients list due to asynchronous operations, but the new leader has not officially
     * taken over yet. This can result in a situation where, upon page refresh, multiple leaders are being reported.
     * This early return statement here will prevent that from happening by maintaining the current leader as
     * the 'active leader' until the other leader is fully promoted.
     */
    if (isPromotingNewLeader) {
        return true;
    }

    const lastActiveClient = activeClients.length && activeClients.at(-1);

    return lastActiveClient === clientID;
};

const becameLeaderCallbacks = new Set<() => void>();
let wasLeader = false;

/**
 * Runs the callbacks each time this tab becomes the leader, so work that waits for a leader (like the SequentialQueue) can start right away.
 * This matters because the Web Lock is granted asynchronously, after the code that tried to flush on focus already gave up.
 */
const onBecomeLeader: OnBecomeLeader = (callback) => {
    becameLeaderCallbacks.add(callback);
    return () => becameLeaderCallbacks.delete(callback);
};

const notifyIfBecameLeader = () => {
    const isLeader = isClientTheLeader();
    const didBecomeLeader = isLeader && !wasLeader;
    wasLeader = isLeader;
    if (!didBecomeLeader) {
        return;
    }
    for (const callback of becameLeaderCallbacks) {
        callback();
    }
};

// We have opted for `connectWithoutView` here as this code is not connected to UI at all.
Onyx.connectWithoutView({
    key: ONYXKEYS.ACTIVE_CLIENTS,
    callback: (val) => {
        if (!val) {
            return;
        }

        activeClients = val;

        // Remove from the beginning of the list any clients that are past the limit, to avoid having thousands of them
        let removed = false;
        while (activeClients.length >= maxClients) {
            activeClients.shift();
            removed = true;
        }

        // Save the clients back to onyx, if they changed
        if (removed) {
            setActiveClients(activeClients);
        }

        notifyIfBecameLeader();
    },
});

/**
 * Requests the leader lock. A steal takes it from the current leader right away. Otherwise we wait in line until the leader's tab goes away.
 * If we make a new request before an older one is granted, the older one gives the lock back as soon as it gets it.
 */
const requestLeaderLock = (shouldSteal: boolean) => {
    leaderLockRequestID++;
    const requestID = leaderLockRequestID;
    isStealingLeaderLock = shouldSteal;
    waitForLeaderLockController?.abort();
    waitForLeaderLockController = shouldSteal ? undefined : new AbortController();
    const options: LockOptions = shouldSteal ? {steal: true} : {signal: waitForLeaderLockController?.signal};

    navigator.locks
        .request(LEADER_LOCK_NAME, options, () => {
            if (requestID !== leaderLockRequestID) {
                return;
            }
            isHoldingLeaderLock = true;
            isStealingLeaderLock = false;
            resolveSavedSelfPromise();

            // Saving our ID last tells older build tabs that we lead, and re-renders the UI that depends on the leader in every tab (see SignInPage)
            setActiveClients([clientID]);
            notifyIfBecameLeader();

            // Hold the lock until this tab goes away or another tab steals it
            return new Promise<void>(() => {});
        })
        .catch(() => {
            // The request was aborted because we superseded it, or another tab stole the lock from us
            if (requestID !== leaderLockRequestID) {
                return;
            }
            isHoldingLeaderLock = false;
            notifyIfBecameLeader();
            requestLeaderLock(false);
        });
};

const cleanUpClientId = () => {
    isPromotingNewLeader = isClientTheLeader();
    activeClients = activeClients.filter((id) => id !== clientID);
    setActiveClients(activeClients);
};

const removeBeforeUnloadListener = () => {
    if (!beforeunloadListenerAdded) {
        return;
    }
    beforeunloadListenerAdded = false;
    window.removeEventListener('beforeunload', cleanUpClientId);
};

/**
 * Add our client ID to the list of active IDs.
 * We want to ensure we have no duplicates and that the activeClient gets added at the end of the array (see isClientTheLeader)
 */
const init: Init = () => {
    if (canUseWebLocks()) {
        if (isHoldingLeaderLock) {
            // Take leadership back from an older build tab that saved its ID after ours
            setActiveClients([clientID]);
        } else if (!isStealingLeaderLock) {
            requestLeaderLock(true);
        }
        if (!beforeunloadListenerAdded) {
            beforeunloadListenerAdded = true;
            window.addEventListener('beforeunload', () => setModalVisibility(false));
        }
        return;
    }

    removeBeforeUnloadListener();
    activeClients = activeClients.filter((id) => id !== clientID);
    activeClients.push(clientID);
    setActiveClients(activeClients).then(resolveSavedSelfPromise);
    notifyIfBecameLeader();

    beforeunloadListenerAdded = true;
    window.addEventListener('beforeunload', () => {
        cleanUpClientId();
        setModalVisibility(false);
    });
};

export {init, isClientTheLeader, isReady, onBecomeLeader};
