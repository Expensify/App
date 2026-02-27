import React, {useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const styles = useThemeStyles();
    const [isLoadingSubscriptionData] = useOnyx(ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA);
    const {isOffline} = useNetwork({
        onReconnect: () => openSubscriptionPage(),
    });

    // Fetch fresh billing NVPs from the server on mount.
    // The cached billing data may be stale, causing the restriction to persist
    // even after the workspace owner has resolved their billing issue.
    useEffect(() => {
        openSubscriptionPage();
    }, []);

    // Watch billing NVPs so the component re-renders when fresh data arrives from the server.
    const [userBillingGracePeriodCollection] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);

    // Navigate back if the fresh server data shows the restriction no longer applies.
    useEffect(() => {
        if (isLoadingSubscriptionData !== false) {
            return;
        }
        if (!shouldRestrictUserBillableActions(policyID, userBillingGracePeriodCollection)) {
            Navigation.goBack();
        }
    }, [policyID, isLoadingSubscriptionData, userBillingGracePeriodCollection]);

    // Show a loading indicator while waiting for fresh billing data from the server,
    // instead of flashing the restriction UI which may no longer apply.
    // Skip the loading indicator when offline since the API call won't go through.
    if (isLoadingSubscriptionData !== false && !isOffline) {
        return <FullScreenLoadingIndicator style={styles.opacity1} />;
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
