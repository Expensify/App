import React, {useEffect, useRef, useState} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {openSubscriptionPage} from '@libs/actions/Subscription';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RestrictedActionParamList} from '@libs/Navigation/types';
import {isPolicyAdmin, isPolicyOwner, isPolicyUser} from '@libs/PolicyUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import WorkspaceAdminRestrictedAction from './WorkspaceAdminRestrictedAction';
import WorkspaceOwnerRestrictedAction from './WorkspaceOwnerRestrictedAction';
import WorkspaceUserRestrictedAction from './WorkspaceUserRestrictedAction';

type WorkspaceRestrictedActionPageProps = PlatformStackScreenProps<RestrictedActionParamList, typeof SCREENS.RESTRICTED_ACTION_ROOT>;

function WorkspaceRestrictedActionPage({
    route: {
        params: {policyID},
    },
}: WorkspaceRestrictedActionPageProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const policy = usePolicy(policyID);
    const [isCheckingBilling, setIsCheckingBilling] = useState(true);
    const isFirstRender = useRef(true);

    // Fetch fresh billing NVPs from the server on mount.
    // The cached billing data may be stale, causing the restriction to persist
    // even after the workspace owner has resolved their billing issue.
    useEffect(() => {
        openSubscriptionPage();

        // Fallback: if the API returns identical data (restriction genuinely applies)
        // or fails, stop showing the loading indicator after a timeout.
        const timer = setTimeout(() => setIsCheckingBilling(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    // Watch billing NVPs so the component re-renders when fresh data arrives from the server.
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriodCollection] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);

    // When fresh billing data arrives from the server, stop showing
    // the loading indicator and navigate back if the restriction has been resolved.
    useEffect(() => {
        // Skip the first execution (mount) since it uses stale cached data.
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Responding to fresh billing data arriving from the server via Onyx.
        setIsCheckingBilling(false);
        if (!shouldRestrictUserBillableActions(policyID, userBillingGracePeriodCollection)) {
            Navigation.goBack();
        }
    }, [policyID, amountOwed, ownerBillingGracePeriodEnd, userBillingGracePeriodCollection]);

    // Show a loading indicator while waiting for fresh billing data from the server,
    // instead of flashing the restriction UI which may no longer apply.
    if (isCheckingBilling) {
        return <FullScreenLoadingIndicator />;
    }

    // Workspace Owner
    if (isPolicyOwner(policy, session?.accountID ?? CONST.DEFAULT_NUMBER_ID)) {
        return <WorkspaceOwnerRestrictedAction />;
    }

    // Workspace Admin
    if (isPolicyAdmin(policy, session?.email)) {
        return <WorkspaceAdminRestrictedAction policyID={policyID} />;
    }

    // Workspace User
    if (isPolicyUser(policy, session?.email)) {
        return <WorkspaceUserRestrictedAction policyID={policyID} />;
    }

    return <NotFoundPage />;
}

export default WorkspaceRestrictedActionPage;
