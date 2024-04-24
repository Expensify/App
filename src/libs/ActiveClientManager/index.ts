/**
 * When you have many tabs in one browser, the data of Onyx is shared between all of them. Since we persist write requests in Onyx, we need to ensure that
 * only one tab is processing those saved requests or we would be duplicating data (or creating errors).
 * This file ensures exactly that by tracking all the clientIDs connected, storing the most recent one last and it considers that last clientID the "leader".
 */
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import * as ActiveClients from '@userActions/ActiveClients';
import ONYXKEYS from '@src/ONYXKEYS';
import type { Init, IsClientTheLeader, IsReady } from './types';

const clientID = Str.guid();
const maxClients = 20;
const ACTIVE_CLIENT_LEFT_KEY = 'activeClientLeft';
let activeClients: string[] = [];
let resolveSavedSelfPromise: () => void;
const savedSelfPromise = new Promise<void>((resolve) => {
    resolveSavedSelfPromise = resolve;
});

/**
 * Determines when the client is ready. We need to wait both till we saved our ID in onyx AND the init method was called
 */
const isReady: IsReady = () => savedSelfPromise;

Onyx.connect({
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
            ActiveClients.setActiveClients(activeClients);
        }
    },
});

const cleanUpOnPageHide = () => {
    // notify other open tabs that this client is closed
    localStorage.setItem(ACTIVE_CLIENT_LEFT_KEY, clientID);
};

const syncLocal = ({ key, newValue: clientLeftID }: StorageEvent) => {
    if (key !== ACTIVE_CLIENT_LEFT_KEY) {
        return;
    }

    // clean clientID of recently closed tab
    // since it's not possible to write to IDB on closing stage
    if (clientLeftID && activeClients.includes(clientLeftID) && clientLeftID !== clientID) {
        activeClients = activeClients.filter(id => id !== clientLeftID);
        ActiveClients.setActiveClients(activeClients);
    }
    localStorage.removeItem(ACTIVE_CLIENT_LEFT_KEY);
};

const setupCleanUp = () => {
    const previousClientID = localStorage.getItem(ACTIVE_CLIENT_LEFT_KEY);

    // cleanup of last closed client
    if (previousClientID) {
        activeClients = activeClients.filter((id) => id !== previousClientID);
        ActiveClients.setActiveClients(activeClients);
        localStorage.removeItem(ACTIVE_CLIENT_LEFT_KEY);
    }

    // use onpagehide event since onbeforeunload in not recommended. keeping beforeunload for legacy browsers
    // https://developer.chrome.com/docs/web-platform/page-lifecycle-api#the_beforeunload_event
    const terminationEvent = 'onpagehide' in window ? 'pagehide' : 'beforeunload';

    // for tracking tab close
    window.addEventListener(terminationEvent, cleanUpOnPageHide);

    // listen to localStorage change
    window.addEventListener('storage', syncLocal);
};

/**
 * Add our client ID to the list of active IDs.
 * We want to ensure we have no duplicates and that the activeClient gets added at the end of the array (see isClientTheLeader)
 */
const init: Init = () => {
    activeClients = activeClients.filter((id) => id !== clientID);
    activeClients.push(clientID);
    ActiveClients.setActiveClients(activeClients).then(resolveSavedSelfPromise);

    setupCleanUp();
};

/**
 * The last GUID is the most recent GUID, so that should be the leader
 */
const isClientTheLeader: IsClientTheLeader = () => {
    const lastActiveClient = activeClients.length && activeClients[activeClients.length - 1];

    return lastActiveClient === clientID;
};

export { init, isClientTheLeader, isReady };
