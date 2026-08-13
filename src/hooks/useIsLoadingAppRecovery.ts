import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import {openApp} from '@userActions/App';
import {getAll as getAllPersistedRequests, getOngoingRequest} from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {accountIDSelector} from '@selectors/Session';
import {useEffect, useRef} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

// How often to check whether IS_LOADING_APP is stranded. This is a check cadence, not a timeout:
// a slow but legitimate OpenApp (large accounts can take 30s+) is visible as a pending request at
// every check, so the recovery waits for it instead of interfering. Only a `true` with no pending
// OpenApp/ReconnectApp anywhere is treated as stranded.
const STRANDED_IS_LOADING_APP_RECOVERY_DELAY_MS = 10000;

/**
 * Recovers IS_LOADING_APP when it can no longer resolve on its own. The key is only ever cleared by
 * finallyData of the OpenApp/ReconnectApp family — the backend never writes it — and the optimistic `true`
 * persists immediately while the clearing finallyData is held in memory until the sequential queue flushes.
 * An interrupted session can therefore leave the key `undefined` or stranded at `true` across reloads, with
 * nothing left to reset it. This hook re-opens the app in both cases.
 */
function useIsLoadingAppRecovery() {
    const hasHandledMissingIsLoadingAppRef = useRef(false);
    const hasHandledStrandedIsLoadingAppRef = useRef(false);

    const [hasLoadedApp] = useOnyx(ONYXKEYS.HAS_LOADED_APP);
    const [isLoadingApp, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [sessionAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const {isOffline} = useNetwork();

    // Recovery: if isLoadingApp is missing after the app is ready, re-open the app
    useEffect(() => {
        if (hasHandledMissingIsLoadingAppRef.current || !hasLoadedApp || isLoadingApp !== undefined || isOffline || isLoadingOnyxValue(isLoadingAppMetadata)) {
            return;
        }
        hasHandledMissingIsLoadingAppRef.current = true;
        Log.info('[Onyx] isLoadingApp missing after app is ready', false, {
            sessionAccountID,
            hasLoadedApp: !!hasLoadedApp,
        });
        openApp();
    }, [hasLoadedApp, isLoadingApp, isOffline, sessionAccountID, isLoadingAppMetadata]);

    // Recovery: if isLoadingApp stays `true` while the app is loaded and online with no reconnect-family
    // request pending, the clearing finallyData was lost — re-open the app.
    useEffect(() => {
        if (hasHandledStrandedIsLoadingAppRef.current || !hasLoadedApp || isLoadingApp !== true || isOffline || isLoadingOnyxValue(isLoadingAppMetadata)) {
            return;
        }

        let timeoutID: ReturnType<typeof setTimeout>;
        const checkStranded = () => {
            // A legitimate in-flight load still has a reconnect-family request pending; only the
            // stranded case has none. In that case check again later instead of giving up — the effect
            // dependencies won't change if that request is later removed without applying its finallyData.
            const hasPendingReconnectRequest = [getOngoingRequest(), ...getAllPersistedRequests()].some(
                (request) => request?.command === WRITE_COMMANDS.OPEN_APP || request?.command === WRITE_COMMANDS.RECONNECT_APP,
            );
            if (hasPendingReconnectRequest) {
                timeoutID = setTimeout(checkStranded, STRANDED_IS_LOADING_APP_RECOVERY_DELAY_MS);
                return;
            }
            hasHandledStrandedIsLoadingAppRef.current = true;
            Log.info('[Onyx] isLoadingApp stranded true with no pending OpenApp/ReconnectApp, re-opening', false, {
                sessionAccountID,
                hasLoadedApp: !!hasLoadedApp,
            });
            openApp();
        };
        timeoutID = setTimeout(checkStranded, STRANDED_IS_LOADING_APP_RECOVERY_DELAY_MS);

        return () => clearTimeout(timeoutID);
    }, [hasLoadedApp, isLoadingApp, isOffline, sessionAccountID, isLoadingAppMetadata]);
}

export default useIsLoadingAppRecovery;
