/**
 * When you have many tabs in one browser, the data of Onyx is shared between all of them. Since we persist write requests in Onyx, we need to ensure that
 * only one tab is processing those saved requests or we would be duplicating data (or creating errors).
 * This file ensures exactly that by tracking all the clientIDs connected, storing the most recent one last and it considers that last clientID the "leader".
 */
import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';
import {setActiveClients} from '@userActions/ActiveClients';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Init, IsClientTheLeader, IsReady} from './types';

const clientID = Str.guid();
const maxClients = 20;
let activeClients: string[] = [];
let resolveSavedSelfPromise: () => void;
const savedSelfPromise = new Promise<void>((resolve) => {
    resolveSavedSelfPromise = resolve;
});
let beforeunloadListenerAdded = false;

/**
 * Determines when the client is ready. We need to wait both till we saved our ID in onyx AND the init method was called
 */
const isReady: IsReady = () => savedSelfPromise;

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
    },
});

let isPromotingNewLeader = false;

/**
 * The last GUID is the most recent GUID, so that should be the leader
 */
const isClientTheLeader: IsClientTheLeader = () => {
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
    removeBeforeUnloadListener();
    activeClients = activeClients.filter((id) => id !== clientID);
    activeClients.push(clientID);
    setActiveClients(activeClients).then(resolveSavedSelfPromise);

    beforeunloadListenerAdded = true;
    window.addEventListener('beforeunload', () => {
        cleanUpClientId();
    });
};

export {init, isClientTheLeader, isReady};
