import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import useIsNewSubscription from '@hooks/useIsNewSubscription';
import {getOwnedPaidPolicies} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import {getCurrentUserAccountID} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalPolicyTypeExludedProps} from './SubscriptionPlanCard';

type SubscriptionPlanCardActionButtonProps = {
    // TODO: add comments
    subscriptionPlan: PersonalPolicyTypeExludedProps | null;
    isFromComparisonModal: boolean;
    isSelected: boolean;
};

function SubscriptionPlanCardActionButton({subscriptionPlan, isFromComparisonModal, isSelected}: SubscriptionPlanCardActionButtonProps) {
    const isNewSubscription = useIsNewSubscription();
    const currentUserAccountID = getCurrentUserAccountID();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const ownerPolicies = useMemo(() => getOwnedPaidPolicies(policies, currentUserAccountID), [policies, currentUserAccountID]);

    const handlePlanPress = (planType: PersonalPolicyTypeExludedProps) => {
        // If the selected plan and the current plan are the same, and the user has no policies, return.
        if (planType === subscriptionPlan || !ownerPolicies.length) {
            return;
        }

        // If the user has one policy as owner and selected plan is team, navigate to downgrade page.
        if (ownerPolicies.length === 1 && planType === CONST.POLICY.TYPE.TEAM) {
            Navigation.navigate(ROUTES.WORKSPACE_DOWNGRADE.getRoute(ownerPolicies.at(0)?.id, Navigation.getActiveRoute()));
            return;
        }

        // If the user has one policy as owner and selected plan is corporate, navigate to upgrade page.
        if (ownerPolicies.length === 1 && planType === CONST.POLICY.TYPE.CORPORATE) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(ownerPolicies.at(0)?.id, undefined, Navigation.getActiveRoute()));
            return;
        }

        // If the user has multiple policies as owner and selected plan is team, navigate to downgrade page.
        if (ownerPolicies.length > 1 && planType === CONST.POLICY.TYPE.TEAM) {
            Navigation.navigate(ROUTES.WORKSPACE_DOWNGRADE.getRoute(undefined, Navigation.getActiveRoute()));
            return;
        }

        //  If the user has multiple policies as owner and selected plan is corporate, navigate to upgrade page.
        if (ownerPolicies.length > 1 && planType === CONST.POLICY.TYPE.CORPORATE) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(undefined, undefined, Navigation.getActiveRoute()));
        }
    };

    if (subscriptionPlan === CONST.POLICY.TYPE.TEAM) {
        // collect
        if (isFromComparisonModal) {
            if (isSelected) {
                // returns the disabled button saying "This is your current plan"
            } else {
                // returns button "Downgrade to collect"
            }
        } else if (isNewSubscription) {
            // returns "Add members" button
        } else {
            // returns "Subscription settings" menu item
        }
    }

    if (subscriptionPlan === CONST.POLICY.TYPE.CORPORATE) {
        // control
        if (isFromComparisonModal) {
            if (isSelected) {
                // returns the disabled button saying "This is your current plan"
            } else {
                // returns button "Upgrade to control"
            }
        } else {
            // returns "Subscription settings" menu item
        }
    }
}

export default SubscriptionPlanCardActionButton;
