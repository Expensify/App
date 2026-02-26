import React, {useEffect} from 'react';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {openSubscriptionPage} from '@libs/actions/Subscription';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RestrictedActionParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
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

    // Fetch fresh billing NVPs from the server on mount.
    // The cached billing data may be stale, causing the restriction to persist
    // even after the workspace owner has resolved their billing issue.
    useEffect(() => {
        openSubscriptionPage();
    }, []);

    // Watch billing NVPs so the component re-renders when fresh data arrives from the server.
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriodCollection] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);

    // Navigate back if the fresh server data shows the restriction no longer applies.
    useEffect(() => {
        if (shouldRestrictUserBillableActions(policyID, userBillingGracePeriodCollection)) {
            return;
        }
        Navigation.goBack();
    }, [policyID, amountOwed, ownerBillingGracePeriodEnd, userBillingGracePeriodCollection]);

    // Workspace Owner
    if (PolicyUtils.isPolicyOwner(policy, session?.accountID ?? -1)) {
        return <WorkspaceOwnerRestrictedAction />;
    }

    // Workspace Admin
    if (PolicyUtils.isPolicyAdmin(policy, session?.email)) {
        return <WorkspaceAdminRestrictedAction policyID={policyID} />;
    }

    // Workspace User
    if (PolicyUtils.isPolicyUser(policy, session?.email)) {
        return <WorkspaceUserRestrictedAction policyID={policyID} />;
    }

    return <NotFoundPage />;
}

export default WorkspaceRestrictedActionPage;
