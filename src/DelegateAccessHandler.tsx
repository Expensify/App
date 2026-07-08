import {useEffect, useRef} from 'react';

import CONST from './CONST';
import useNetwork from './hooks/useNetwork';
import useOnyx from './hooks/useOnyx';
import {openApp} from './libs/actions/App';
import {disconnect} from './libs/actions/Delegate';
import {getAll as getAllPersistedRequests, getOngoingRequest} from './libs/actions/PersistedRequests';
import {WRITE_COMMANDS} from './libs/API/types';
import Log from './libs/Log';
import ONYXKEYS from './ONYXKEYS';
import {accountIDSelector, emailSelector} from './selectors/Session';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

// How long IS_LOADING_APP may stay `true` before we treat it as stranded. A legitimate OpenApp settles
// well under this; anything longer means the request that would clear the flag is no longer around.
const STRANDED_IS_LOADING_APP_RECOVERY_DELAY_MS = 10000;

/**
 * Component that does not render anything but isolates delegate-access–related Onyx subscriptions
 * (account, stashedCredentials, stashedSession, hasLoadedApp, isLoadingApp)
 * from the root Expensify component so that changes to these keys do not
 * re-render the entire navigation tree.
 */
function DelegateAccessHandler() {
    const hasLoggedDelegateMismatchRef = useRef(false);
    const hasHandledMissingIsLoadingAppRef = useRef(false);
    const hasHandledStrandedIsLoadingAppRef = useRef(false);

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [stashedCredentials = CONST.EMPTY_OBJECT] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS);
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION);
    const [hasLoadedApp] = useOnyx(ONYXKEYS.HAS_LOADED_APP);
    const [isLoadingApp, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [sessionAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const {isOffline} = useNetwork();

    // Disconnect delegate when the delegate is no longer in the delegates list
    useEffect(() => {
        if (!account?.delegatedAccess?.delegate) {
            return;
        }
        if (account?.delegatedAccess?.delegates?.some((d) => d.email === account?.delegatedAccess?.delegate)) {
            return;
        }
        disconnect({stashedCredentials, stashedSession});
    }, [account?.delegatedAccess?.delegates, account?.delegatedAccess?.delegate, stashedCredentials, stashedSession]);

    // Log delegate mismatch after the app has loaded
    useEffect(() => {
        if (hasLoggedDelegateMismatchRef.current || !hasLoadedApp || isLoadingApp) {
            return;
        }
        const delegators = account?.delegatedAccess?.delegators ?? [];
        const hasDelegatorMatch = !!sessionEmail && delegators.some((delegator) => delegator.email === sessionEmail);
        const shouldLogMismatch = hasDelegatorMatch && !!account?.primaryLogin && !account?.delegatedAccess?.delegate;
        if (!shouldLogMismatch) {
            return;
        }
        hasLoggedDelegateMismatchRef.current = true;
        Log.info('[Delegate] Missing delegate field after switch', false, {
            sessionAccountID,
            delegatorsCount: delegators.length,
            hasPrimaryLogin: !!account?.primaryLogin,
        });
    }, [account?.delegatedAccess?.delegate, account?.delegatedAccess?.delegators, account?.primaryLogin, hasLoadedApp, isLoadingApp, sessionAccountID, sessionEmail]);

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

    // Recovery: isLoadingApp is only ever cleared by finallyData of the OpenApp/ReconnectApp family — the
    // backend never writes this key. The optimistic `true` persists immediately while the clearing
    // finallyData is held in memory until the sequential queue flushes, so if the session is interrupted
    // in that window, `true` survives reloads with nothing left to reset it. The recovery above only
    // covers the `undefined` case, so when the flag stays `true` while the app is loaded and online with
    // no reconnect-family request pending, re-open the app.
    useEffect(() => {
        if (hasHandledStrandedIsLoadingAppRef.current || !hasLoadedApp || isLoadingApp !== true || isOffline || isLoadingOnyxValue(isLoadingAppMetadata)) {
            return;
        }

        const timeoutID = setTimeout(() => {
            // A legitimate in-flight load still has a reconnect-family request pending; only the
            // stranded case has none. Checking after the delay avoids racing the request being queued.
            const hasPendingReconnectRequest = [getOngoingRequest(), ...getAllPersistedRequests()].some(
                (request) => request?.command === WRITE_COMMANDS.OPEN_APP || request?.command === WRITE_COMMANDS.RECONNECT_APP,
            );
            if (hasPendingReconnectRequest) {
                return;
            }
            hasHandledStrandedIsLoadingAppRef.current = true;
            Log.info('[Onyx] isLoadingApp stranded true with no pending OpenApp, re-opening', false, {
                sessionAccountID,
                hasLoadedApp: !!hasLoadedApp,
            });
            openApp();
        }, STRANDED_IS_LOADING_APP_RECOVERY_DELAY_MS);

        return () => clearTimeout(timeoutID);
    }, [hasLoadedApp, isLoadingApp, isOffline, sessionAccountID, isLoadingAppMetadata]);

    return null;
}

export default DelegateAccessHandler;
