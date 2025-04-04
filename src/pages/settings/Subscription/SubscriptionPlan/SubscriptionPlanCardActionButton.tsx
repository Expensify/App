import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useIsNewSubscription from '@hooks/useIsNewSubscription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getOwnedPaidPolicies} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import {getCurrentUserAccountID} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import AddMembersButton from './AddMembersButton';
import type {PersonalPolicyTypeExludedProps} from './SubscriptionPlanCard';

type SubscriptionPlanCardActionButtonProps = {
    /** Subscription plan to display */
    subscriptionPlan: PersonalPolicyTypeExludedProps | null;

    /** Whether the plan card was rendered inside the comparison modal */
    isFromComparisonModal: boolean;

    /** Whether the plan is currently used */
    isSelected: boolean;

    /** Closes comparison modal */
    closeComparisonModal?: () => void;
};

function SubscriptionPlanCardActionButton({subscriptionPlan, isFromComparisonModal, isSelected, closeComparisonModal}: SubscriptionPlanCardActionButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isNewSubscription = useIsNewSubscription();
    const currentUserAccountID = getCurrentUserAccountID();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const ownerPolicies = useMemo(() => getOwnedPaidPolicies(policies, currentUserAccountID), [policies, currentUserAccountID]);

    const handlePlanPress = (planType: PersonalPolicyTypeExludedProps) => {
        closeComparisonModal?.();

        // If user has no policies, return.
        if (!ownerPolicies.length) {
            return;
        }

        const ownerPolicy = ownerPolicies.length === 1 ? ownerPolicies.at(0)?.id : undefined;

        if (planType === CONST.POLICY.TYPE.TEAM) {
            Navigation.navigate(ROUTES.WORKSPACE_DOWNGRADE.getRoute(ownerPolicy, Navigation.getActiveRoute()));
            return;
        }

        if (planType === CONST.POLICY.TYPE.CORPORATE) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(ownerPolicy, undefined, Navigation.getActiveRoute()));
        }
    };

    const currentPlanLabel = (
        <View style={[styles.button, styles.buttonContainer, styles.outlinedButton, styles.mh5]}>
            <Text style={styles.textLabelSupporting}>{translate('subscription.yourPlan.thisIsYourCurrentPlan')}</Text>
        </View>
    );

    if (subscriptionPlan === CONST.POLICY.TYPE.TEAM) {
        if (isFromComparisonModal) {
            if (isSelected) {
                return currentPlanLabel;
            }
            return (
                <Button
                    text={translate('subscription.yourPlan.downgrade')}
                    style={styles.ph5}
                    onPress={() => handlePlanPress(CONST.POLICY.TYPE.TEAM)}
                />
            );
        }
        if (isNewSubscription) {
            return <AddMembersButton />;
        }
    }

    if (subscriptionPlan === CONST.POLICY.TYPE.CORPORATE) {
        if (isFromComparisonModal) {
            if (isSelected) {
                return currentPlanLabel;
            }
            return (
                <Button
                    success
                    style={styles.ph5}
                    text={translate('subscription.yourPlan.upgrade')}
                    onPress={() => handlePlanPress(CONST.POLICY.TYPE.CORPORATE)}
                />
            );
        }
    }

    const autoIncrease = privateSubscription?.addNewUsersAutomatically ? translate('subscription.subscriptionSettings.on') : translate('subscription.subscriptionSettings.off');
    const subscriptionType = isAnnual ? translate('subscription.subscriptionSettings.annual') : translate('subscription.details.payPerUse');
    const subscriptionSize = `${privateSubscription?.userCount ?? translate('subscription.subscriptionSettings.none')}`;
    const autoRenew = privateSubscription?.autoRenew ? translate('subscription.subscriptionSettings.on') : translate('subscription.subscriptionSettings.off');

    return (
        <MenuItemWithTopDescription
            description={translate('subscription.subscriptionSettings.title')}
            shouldShowRightIcon
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SETTINGS_DETAILS)}
            numberOfLinesTitle={3}
            title={translate('subscription.subscriptionSettings.summary', {subscriptionType, subscriptionSize, autoRenew, autoIncrease})}
        />
    );
}

export default SubscriptionPlanCardActionButton;
