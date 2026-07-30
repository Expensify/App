import {useEffect, useRef} from 'react';

import CONST from './CONST';
import useIsLoadingAppRecovery from './hooks/useIsLoadingAppRecovery';
import useOnyx from './hooks/useOnyx';
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

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [stashedCredentials = CONST.EMPTY_OBJECT] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS);
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION);
    const [hasLoadedApp] = useOnyx(ONYXKEYS.HAS_LOADED_APP);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [sessionAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    useIsLoadingAppRecovery();

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

    return null;
}

export default DelegateAccessHandler;
