import {useEffect, useRef} from 'react';
import CONST from './CONST';
import useNetwork from './hooks/useNetwork';
import useOnyx from './hooks/useOnyx';
import {confirmReadyToOpenApp, openApp} from './libs/actions/App';
import {disconnect} from './libs/actions/Delegate';
import Log from './libs/Log';
import ONYXKEYS from './ONYXKEYS';
import {accountIDSelector, emailSelector} from './selectors/Session';

/**
 * Component that does not render anything but isolates delegate-access–related Onyx subscriptions
 * (account, stashedCredentials, stashedSession, hasLoadedApp, isLoadingApp)
 * from the root Expensify component so that changes to these keys do not
 * re-render the entire navigation tree.
 */
function DelegateAccessHandler() {
    const hasLoggedDelegateMismatchRef = useRef(false);
    const hasHandledMissingIsLoadingAppRef = useRef(false);

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [stashedCredentials = CONST.EMPTY_OBJECT] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS);
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION);
    const [hasLoadedApp] = useOnyx(ONYXKEYS.HAS_LOADED_APP);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
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
        if (hasHandledMissingIsLoadingAppRef.current || !hasLoadedApp || isLoadingApp !== undefined || isOffline) {
            return;
        }
        hasHandledMissingIsLoadingAppRef.current = true;
        Log.info('[Onyx] isLoadingApp missing after app is ready', false, {
            sessionAccountID,
            hasLoadedApp: !!hasLoadedApp,
        });
        confirmReadyToOpenApp();
        openApp();
    }, [hasLoadedApp, isLoadingApp, isOffline, sessionAccountID]);

    return null;
}

export default DelegateAccessHandler;
