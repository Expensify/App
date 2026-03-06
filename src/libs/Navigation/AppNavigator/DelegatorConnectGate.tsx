import React, {Suspense, use} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import {connect} from '@libs/actions/Delegate';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import {getSearchParamFromUrl} from '@libs/Url';
import * as App from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';

let connectPromise: Promise<boolean | undefined> | null = null;

type DelegatorConnectGateProps = {
    delegatorEmail: string;
    children: React.ReactNode;
};

/**
 * Gate component — only mounted when delegatorEmail exists.
 * Owns Onyx subscriptions needed for Delegate.connect() and suspends
 * via use() until the connect promise resolves.
 */
function DelegatorConnectGate({children, delegatorEmail}: DelegatorConnectGateProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);

    // Module-level cache survives unmount/remount cycles caused by Onyx.clear() inside connect().
    // connect() always returns a Promise when isFromOldDot is true.
    connectPromise ??=
        connect({
            email: delegatorEmail,
            delegatedAccess: account?.delegatedAccess,
            credentials,
            session,
            activePolicyID,
            isFromOldDot: true,
        })?.then((success) => {
            App.setAppLoading(!!success);
            return success;
        }) ?? Promise.resolve(undefined);

    use(connectPromise);

    return children;
}

/**
 * Cheap composable guard. Parses URL for delegatorEmail.
 * If absent, renders children directly (no hooks, no Onyx, no Suspense).
 * If present, wraps children in Suspense + DelegatorConnectGate.
 */
function DelegatorConnectGuard({children}: {children: React.ReactNode}) {
    const delegatorEmail = getSearchParamFromUrl(getCurrentUrl(), 'delegatorEmail');

    if (!delegatorEmail) {
        return children;
    }

    return (
        <Suspense fallback={<FullScreenLoadingIndicator />}>
            <DelegatorConnectGate delegatorEmail={delegatorEmail}>{children}</DelegatorConnectGate>
        </Suspense>
    );
}

export default DelegatorConnectGuard;
