import {useEffect, useRef} from 'react';

import CONST from './CONST';
import useIsLoadingAppRecovery from './hooks/useIsLoadingAppRecovery';
import useOnyx from './hooks/useOnyx';
import usePrevious from './hooks/usePrevious';
import {disconnect, resumeSelfRemovalAsDelegate} from './libs/actions/Delegate';
import Log from './libs/Log';
import ONYXKEYS from './ONYXKEYS';
import {accountIDSelector, emailSelector, isDelegateSessionSelector} from './selectors/Session';

/**
 * Component that does not render anything but isolates delegate-access–related Onyx subscriptions
 * (account, stashedCredentials, stashedSession, pendingSelfCopilotRemoval, hasLoadedApp, isLoadingApp)
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
    const [isDelegateSession] = useOnyx(ONYXKEYS.SESSION, {selector: isDelegateSessionSelector});
    const [pendingSelfCopilotRemoval] = useOnyx(ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL);

    useIsLoadingAppRecovery();

    // Disconnect delegate when the delegate is no longer in the delegates list
    const delegate = account?.delegatedAccess?.delegate;
    const isDelegateInDelegatesList = account?.delegatedAccess?.delegates?.some((d) => d.email === delegate);
    const wasDelegateInDelegatesList = usePrevious(isDelegateInDelegatesList);
    useEffect(() => {
        if (!delegate) {
            return;
        }
        if (isDelegateInDelegatesList) {
            return;
        }
        // If the delegate was never on the list then do nothing.
        // This is the case for company-owned agents where managers have implicit delegate access without being in the delegates list.
        if (!wasDelegateInDelegatesList) {
            return;
        }
        disconnect({stashedCredentials, stashedSession});
    }, [delegate, isDelegateInDelegatesList, wasDelegateInDelegatesList, stashedCredentials, stashedSession]);

    // Finish a self-removal from a delegator's copilots that a kill interrupted
    useEffect(() => {
        if (!pendingSelfCopilotRemoval || !sessionAccountID) {
            return;
        }
        resumeSelfRemovalAsDelegate({delegatorEmail: pendingSelfCopilotRemoval, isDelegateSession: !!isDelegateSession});
    }, [pendingSelfCopilotRemoval, isDelegateSession, sessionAccountID]);

    // Log delegate mismatch after the app has loaded
    useEffect(() => {
        if (hasLoggedDelegateMismatchRef.current || !hasLoadedApp || isLoadingApp) {
            return;
        }
        const delegators = account?.delegatedAccess?.delegators ?? [];
        const hasDelegatorMatch = !!sessionEmail && delegators.some((delegator) => delegator.email === sessionEmail);
        const shouldLogMismatch = hasDelegatorMatch && !!account?.primaryLogin && !delegate;
        if (!shouldLogMismatch) {
            return;
        }
        hasLoggedDelegateMismatchRef.current = true;
        Log.info('[Delegate] Missing delegate field after switch', false, {
            sessionAccountID,
            delegatorsCount: delegators.length,
            hasPrimaryLogin: !!account?.primaryLogin,
        });
    }, [delegate, account?.delegatedAccess?.delegators, account?.primaryLogin, hasLoadedApp, isLoadingApp, sessionAccountID, sessionEmail]);

    return null;
}

export default DelegateAccessHandler;
