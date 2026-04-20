import React, {useEffect, useRef} from 'react';
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
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
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

    // Watch billing NVPs so the component re-renders when fresh data arrives from the server.
    const [userBillingGracePeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);

    // Track grace periods in a ref so openSubscriptionPage can roll back on failure
    // without adding the collection to effect dependencies (which would re-trigger the fetch
    // on every optimistic update).
    const gracePeriodsRef = useRef(userBillingGracePeriods);
    useEffect(() => {
        gracePeriodsRef.current = userBillingGracePeriods;
    }, [userBillingGracePeriods]);

    const {isOffline} = useNetwork({
        onReconnect: () => openSubscriptionPage(gracePeriodsRef.current),
    });

    // Fetch fresh billing NVPs from the server on mount.
    // The cached billing data may be stale, causing the restriction to persist
    // even after the workspace owner has resolved their billing issue.
    // Skip when offline since the API call won't go through and the optimistic
    // clear would incorrectly lift the restriction.
    useEffect(() => {
        if (isOffline) {
            return;
        }
        openSubscriptionPage(gracePeriodsRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    // Navigate back if the fresh server data shows the restriction no longer applies.
    useEffect(() => {
        if (isLoadingSubscriptionData !== false) {
            return;
        }
        if (!shouldRestrictUserBillableActions(policyID, ownerBillingGracePeriodEnd, userBillingGracePeriods, amountOwed)) {
            Navigation.goBack();
        }
    }, [policyID, isLoadingSubscriptionData, userBillingGracePeriods, ownerBillingGracePeriodEnd, amountOwed]);

    // Show a loading indicator while waiting for fresh billing data from the server,
    // instead of flashing the restriction UI which may no longer apply.
    // Skip the loading indicator when offline since the API call won't go through.
    if (isLoadingSubscriptionData !== false && !isOffline) {
        return (
            <FullScreenLoadingIndicator
                style={styles.opacity1}
                reasonAttributes={{context: 'WorkspaceRestrictedActionPage', isLoadingSubscriptionData} satisfies SkeletonSpanReasonAttributes}
            />
        );
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
