import Button from '@components/Button';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useThemeStyles from '@hooks/useThemeStyles';

import {upgradeToCorporate} from '@libs/actions/Policy/Policy';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {getOwnedPaidPolicies, isPolicyAdmin} from '@libs/PolicyUtils';
import {isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import {useMemo} from 'react';
import {View} from 'react-native';

import type {PersonalPolicyTypeExcludedProps} from './SubscriptionPlanCard';

type SubscriptionPlanCardActionButtonProps = {
    subscriptionPlan: PersonalPolicyTypeExcludedProps | null;

    /** Whether the plan card was rendered inside the comparison modal */
    isFromComparisonModal: boolean;

    isSelected: boolean;
    closeComparisonModal?: () => void;
    style?: StyleProp<ViewStyle>;
};

function SubscriptionPlanCardActionButton({subscriptionPlan, isFromComparisonModal, isSelected, closeComparisonModal, style}: SubscriptionPlanCardActionButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const privateSubscription = usePrivateSubscription();
    const ownerPolicies = useMemo(() => getOwnedPaidPolicies(policies, currentUserAccountID), [policies, currentUserAccountID]);

    const [canPerformUpgrade, policy] = useMemo(() => {
        const firstPolicy = ownerPolicies.at(0);
        if (!firstPolicy || ownerPolicies.length > 1) {
            return [false, undefined];
        }
        return [isPolicyAdmin(firstPolicy), firstPolicy];
    }, [ownerPolicies]);

    const handlePlanPress = (planType: PersonalPolicyTypeExcludedProps) => {
        closeComparisonModal?.();

        // If user has no policies, return.
        if (!ownerPolicies.length) {
            return;
        }
        if (
            (planType === CONST.POLICY.TYPE.TEAM && privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL && !account?.canDowngrade) ||
            isSubscriptionTypeOfInvoicing(privateSubscription?.type)
        ) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.SUBSCRIPTION_DOWNGRADE_BLOCKED.path));
            return;
        }

        if (planType === CONST.POLICY.TYPE.TEAM) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_DOWNGRADE.getRoute(policy?.id)));
            return;
        }

        if (planType === CONST.POLICY.TYPE.CORPORATE) {
            if (canPerformUpgrade && !!policy?.id) {
                upgradeToCorporate(policy);
                closeComparisonModal?.();
                return;
            }
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policy?.id, undefined, Navigation.getActiveRoute()));
        }
    };

    const currentPlanLabel = (
        <View style={style}>
            <View style={[styles.button, styles.buttonContainer, styles.outlinedButton]}>
                <Text style={styles.textLabelSupporting}>{translate('subscription.yourPlan.thisIsYourCurrentPlan')}</Text>
            </View>
        </View>
    );

    if (subscriptionPlan === CONST.POLICY.TYPE.TEAM) {
        if (isFromComparisonModal) {
            if (isSelected) {
                return currentPlanLabel;
            }
            return (
                <Button
                    style={style}
                    onPress={() => handlePlanPress(CONST.POLICY.TYPE.TEAM)}
                >
                    <Button.Text>{translate('subscription.yourPlan.downgrade')}</Button.Text>
                </Button>
            );
        }
    }

    if (subscriptionPlan === CONST.POLICY.TYPE.CORPORATE) {
        if (isFromComparisonModal) {
            if (isSelected) {
                return currentPlanLabel;
            }
            return (
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    style={style}
                    onPress={() => handlePlanPress(CONST.POLICY.TYPE.CORPORATE)}
                >
                    <Button.Text>{translate('subscription.yourPlan.upgrade')}</Button.Text>
                </Button>
            );
        }
    }

    return undefined;
}

export default SubscriptionPlanCardActionButton;
