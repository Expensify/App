import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {isClientTheLeader} from '@libs/ActiveClientManager';
import Log from '@libs/Log';
import {setAuthToken} from '@libs/Network/NetworkStore';
import {unpause as unpauseSequentialQueue} from '@libs/Network/SequentialQueue';
import {finalReconnectAppAfterActivatingReliableUpdates, getMissingOnyxUpdates} from '@userActions/App';
import updateSessionAuthTokens from '@userActions/Session/updateSessionAuthTokens';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer, Session} from '@src/types/onyx';
import {isValidOnyxUpdateFromServer} from '@src/types/onyx/OnyxUpdatesFromServer';
import {validateAndApplyDeferredUpdates} from './utils';
import {
    clear as clearDeferredOnyxUpdates,
    enqueue as enqueueDeferredOnyxUpdates,
    getMissingOnyxUpdatesQueryPromise,
    isEmpty as isEmptyDeferredOnyxUpdates,
    setMissingOnyxUpdatesQueryPromise,
} from './utils/DeferredOnyxUpdates';

// This file is in charge of looking at the updateIDs coming from the server and comparing them to the last updateID that the client has.
// If the client is behind the server, then we need to
// 1. Pause all sequential queue requests
// 2. Pause all Onyx updates from Pusher
// 3. Get the missing updates from the server
// 4. Apply those updates
// 5. Apply the original update that triggered this request (it could have come from either HTTPS or Pusher)
// 6. Restart the sequential queue
// 7. Restart the Onyx updates from Pusher
// This will ensure that the client is up-to-date with the server and all the updates have been applied in the correct order.
// It's important that this file is separate and not imported by OnyxUpdates.js, so that there are no circular dependencies.
// Onyx is used as a pub/sub mechanism to break out of the circular dependency.
// The circular dependency happens because this file calls API.GetMissingOnyxUpdates() which uses the SaveResponseInOnyx.js file (as a middleware).
// Therefore, SaveResponseInOnyx.js can't import and use this file directly.

let lastUpdateIDAppliedToClient: number = CONST.DEFAULT_NUMBER_ID;
// `lastUpdateIDAppliedToClient` is not dependent on any changes on the UI,
// so it is okay to use `connectWithoutView` here.
Onyx.connectWithoutView({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (value) => (lastUpdateIDAppliedToClient = value ?? CONST.DEFAULT_NUMBER_ID),
});

let isLoadingApp = false;
// `isLoadingApp` is not dependent on any changes on the UI,
// so it is okay to use `connectWithoutView` here.
Onyx.connectWithoutView({
    key: ONYXKEYS.IS_LOADING_APP,
    callback: (value) => {
        isLoadingApp = value ?? false;
    },
});

let resolveQueryPromiseWrapper: () => void;
const createQueryPromiseWrapper = () =>
    new Promise<void>((resolve) => {
        resolveQueryPromiseWrapper = resolve;
    });
// eslint-disable-next-line import/no-mutable-exports
let queryPromiseWrapper = createQueryPromiseWrapper();
let isFetchingForPendingUpdates = false;

const resetDeferralLogicVariables = () => {
    clearDeferredOnyxUpdates({shouldUnpauseSequentialQueue: false});
};

// This function will reset the query variables, unpause the SequentialQueue and log an info to the user.
function finalizeUpdatesAndResumeQueue() {
    console.debug('[OnyxUpdateManager] Done applying all updates');

    resolveQueryPromiseWrapper();
    queryPromiseWrapper = createQueryPromiseWrapper();

    clearDeferredOnyxUpdates();
    isFetchingForPendingUpdates = false;
}

/**
 * Triggers the fetching process of either pending or missing updates.
 *
 * @param onyxUpdatesFromServer the current update that is supposed to be applied
 * @param clientLastUpdateID an optional override for the lastUpdateIDAppliedToClient
 *
 * @returns a promise that resolves when all Onyx updates are done being processed
 */
function handleMissingOnyxUpdates(onyxUpdatesFromServer: OnyxEntry<OnyxUpdatesFromServer>, clientLastUpdateID?: number): Promise<void> {
    // If isLoadingApp is positive it means that OpenApp command hasn't finished yet, and in that case
    // we don't have base state of the app (reports, policies, etc.) setup. If we apply this update,
    // we'll only have them overwritten by the openApp response. So let's skip it and return.
    if (isLoadingApp) {
        // When ONYX_UPDATES_FROM_SERVER is set, we pause the queue. Let's unpause
        // it so the app is not stuck forever without processing requests.
        unpauseSequentialQueue();
        console.debug(`[OnyxUpdateManager] Ignoring Onyx updates while OpenApp hasn't finished yet.`);
        return Promise.resolve();
    }
    // This key is shared across clients, thus every client/tab will have a copy and try to execute this method.
    // It is very important to only process the missing onyx updates from leader client otherwise requests we'll execute
    // several duplicated requests that are not controlled by the SequentialQueue.
    if (!isClientTheLeader()) {
        return Promise.resolve();
    }

    // When there is no value or an invalid value, there's nothing to process, so let's return early.
    if (!isValidOnyxUpdateFromServer(onyxUpdatesFromServer)) {
        return Promise.resolve();
    }

    // Check if one of these onyx updates is for the authToken. If it is, let's update our authToken now because our
    // current authToken is probably invalid.
    updateAuthTokenIfNecessary(onyxUpdatesFromServer);

    const shouldFetchPendingUpdates = onyxUpdatesFromServer?.shouldFetchPendingUpdates ?? false;
    const lastUpdateIDFromServer = onyxUpdatesFromServer.lastUpdateID;
    const previousUpdateIDFromServer = onyxUpdatesFromServer.previousUpdateID;
    const lastUpdateIDFromClient = clientLastUpdateID ?? lastUpdateIDAppliedToClient ?? CONST.DEFAULT_NUMBER_ID;

    // Check if the client needs to send a backend request to fetch missing or pending updates and/or queue deferred updates.
    // Returns a boolean indicating whether we should execute the finally block after the promise is done,
    // in which the OnyxUpdateManager finishes its work and the SequentialQueue will is unpaused.
    const checkIfClientNeedsToBeUpdated = (): boolean => {
        // The OnyxUpdateManager can handle different types of re-fetch processes. Either there are pending updates,
        // that we need to fetch manually, or we detected gaps in the previously fetched updates.
        // Each of the flows below sets a promise through `DeferredOnyxUpdates.setMissingOnyxUpdatesQueryPromise`, which we further process.
        if (shouldFetchPendingUpdates) {
            // This flow handles the case where the server didn't send updates because the payload was too big.
            // We need to call the GetMissingOnyxUpdates query to fetch the missing updates up to the pendingLastUpdateID.
            const pendingUpdateID = Number(lastUpdateIDFromServer);

            isFetchingForPendingUpdates = true;

            // If the pendingUpdateID is not newer than the last locally applied update, we don't need to fetch the missing updates.
            if (pendingUpdateID <= lastUpdateIDFromClient) {
                setMissingOnyxUpdatesQueryPromise(Promise.resolve());
                return true;
            }

            console.debug(`[OnyxUpdateManager] Client is fetching pending updates from the server, from updates ${lastUpdateIDFromClient} to ${Number(pendingUpdateID)}`);
            Log.info('There are pending updates from the server, so fetching incremental updates', true, {
                pendingUpdateID,
                lastUpdateIDFromClient,
            });

            // Get the missing Onyx updates from the server and afterward validate and apply the deferred updates.
            // This will trigger recursive calls to "validateAndApplyDeferredUpdates" if there are gaps in the deferred updates.
            setMissingOnyxUpdatesQueryPromise(getMissingOnyxUpdates(lastUpdateIDFromClient, lastUpdateIDFromServer).then(() => validateAndApplyDeferredUpdates(clientLastUpdateID)));

            return true;
        }

        if (!lastUpdateIDFromClient) {
            // This is the first time we're receiving an lastUpdateID, so we need to do a final ReconnectApp query before
            // This flow is setting the promise to a ReconnectApp query.

            // If there is a ReconnectApp query in progress, we should not start another one.
            if (getMissingOnyxUpdatesQueryPromise()) {
                return false;
            }

            Log.info('Client has not gotten reliable updates before so reconnecting the app to start the process');

            // Since this is a full reconnectApp, we'll not apply the updates we received - those will come in the reconnect app request.
            setMissingOnyxUpdatesQueryPromise(finalReconnectAppAfterActivatingReliableUpdates());

            return true;
        }

        // This client already has the reliable updates mode enabled, but it's missing some updates and it needs to fetch those.
        // Therefore, we are calling the GetMissingOnyxUpdates query, to fetch the missing updates.

        const areDeferredUpdatesQueued = !isEmptyDeferredOnyxUpdates();

        // Add the new update to the deferred updates
        enqueueDeferredOnyxUpdates(onyxUpdatesFromServer, {shouldPauseSequentialQueue: false});

        // If there are deferred updates already, we don't need to fetch the missing updates again.
        if (areDeferredUpdatesQueued || isFetchingForPendingUpdates) {
            return false;
        }

        console.debug(`[OnyxUpdateManager] Client is fetching missing updates from the server, from updates ${lastUpdateIDFromClient} to ${Number(previousUpdateIDFromServer)}`);
        Log.info('Gap detected in update IDs from the server so fetching incremental updates', true, {
            lastUpdateIDFromClient,
            lastUpdateIDFromServer,
            previousUpdateIDFromServer,
        });

        // Get the missing Onyx updates from the server and afterwards validate and apply the deferred updates.
        // This will trigger recursive calls to "validateAndApplyDeferredUpdates" if there are gaps in the deferred updates.
        setMissingOnyxUpdatesQueryPromise(getMissingOnyxUpdates(lastUpdateIDFromClient, previousUpdateIDFromServer).then(() => validateAndApplyDeferredUpdates(clientLastUpdateID)));

        return true;
    };
    const shouldFinalizeAndResume = checkIfClientNeedsToBeUpdated();

    if (shouldFinalizeAndResume) {
        return getMissingOnyxUpdatesQueryPromise()?.finally(finalizeUpdatesAndResumeQueue) as Promise<void>;
    }

    return Promise.resolve();
}

function updateAuthTokenIfNecessary(onyxUpdatesFromServer: OnyxEntry<OnyxUpdatesFromServer>): void {
    // Consolidate all of the given Onyx updates
    const onyxUpdates: OnyxUpdate[] = [];
    if (onyxUpdatesFromServer?.updates) {
        for (const updateEvent of onyxUpdatesFromServer.updates) {
            onyxUpdates.push(...updateEvent.data);
        }
    }
    onyxUpdates.push(...(onyxUpdatesFromServer?.response?.onyxData ?? []));

    // Find any session updates
    const sessionUpdates = onyxUpdates?.filter((onyxUpdate) => onyxUpdate.key === ONYXKEYS.SESSION);

    // If any of the updates changes the authToken, let's update it now
    if (sessionUpdates) {
        for (const sessionUpdate of sessionUpdates) {
            const session = (sessionUpdate.value ?? {}) as Session;
            const newAuthToken = session.authToken ?? '';
            if (!newAuthToken) {
                continue;
            }

            Log.info('[OnyxUpdateManager] Found an authToken update while handling an Onyx update gap. Updating the authToken.');
            updateSessionAuthTokens(newAuthToken);
            setAuthToken(newAuthToken);
        }
    }
}

export default () => {
    console.debug('[OnyxUpdateManager] Listening for updates from the server');
    // `Onyx updates` are not dependent on any changes on the UI,
    // so it is okay to use `connectWithoutView` here.
    Onyx.connectWithoutView({
        key: ONYXKEYS.ONYX_UPDATES_FROM_SERVER,
        callback: (value) => {
            handleMissingOnyxUpdates(value);
        },
    });
};

export {handleMissingOnyxUpdates, queryPromiseWrapper as queryPromise, resetDeferralLogicVariables};
