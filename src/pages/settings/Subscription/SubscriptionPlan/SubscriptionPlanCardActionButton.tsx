import Button from '@components/Button';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
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

import {getPrivatePromoDiscountInfo} from '@pages/settings/Subscription/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import type {PersonalPolicyTypeExcludedProps} from './SubscriptionPlanCard';

type SubscriptionPlanCardActionButtonProps = {
    subscriptionPlan: PersonalPolicyTypeExcludedProps | null;

    /** Whether the plan card was rendered inside the comparison modal */
    isFromComparisonModal: boolean;

    isSelected: boolean;
    closeComparisonModal?: () => void;
};

function SubscriptionPlanCardActionButton({subscriptionPlan, isFromComparisonModal, isSelected, closeComparisonModal}: SubscriptionPlanCardActionButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const privateSubscription = usePrivateSubscription();
    const [privatePromoCode] = useOnyx(ONYXKEYS.NVP_PRIVATE_PROMO_CODE);
    const [privatePromoDiscount] = useOnyx(ONYXKEYS.NVP_PRIVATE_PROMO_DISCOUNT);
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const {isSecretPromoCode} = getPrivatePromoDiscountInfo(privatePromoDiscount, isAnnual);
    const ownerPolicies = getOwnedPaidPolicies(policies, currentUserAccountID);

    const policy = ownerPolicies.length === 1 ? ownerPolicies.at(0) : undefined;
    const canPerformUpgrade = !!policy && isPolicyAdmin(policy);

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
        <View style={[styles.button, styles.buttonContainer, styles.outlinedButton]}>
            <Text style={styles.textLabelSupporting}>{translate('subscription.yourPlan.thisIsYourCurrentPlan')}</Text>
        </View>
    );

    if (subscriptionPlan === CONST.POLICY.TYPE.TEAM) {
        if (isFromComparisonModal) {
            if (isSelected) {
                return currentPlanLabel;
            }
            return (
                <Button onPress={() => handlePlanPress(CONST.POLICY.TYPE.TEAM)}>
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
                    onPress={() => handlePlanPress(CONST.POLICY.TYPE.CORPORATE)}
                >
                    <Button.Text>{translate('subscription.yourPlan.upgrade')}</Button.Text>
                </Button>
            );
        }
    }

    if (isSubscriptionTypeOfInvoicing(privateSubscription?.type)) {
        return undefined;
    }

    const autoIncrease = privateSubscription?.addNewUsersAutomatically ? translate('subscription.subscriptionSettings.on') : translate('subscription.subscriptionSettings.off');
    const subscriptionType = isAnnual ? translate('subscription.subscriptionSettings.annual') : translate('subscription.details.payPerUse');
    const subscriptionSize = `${privateSubscription?.userCount ?? translate('subscription.subscriptionSettings.none')}`;
    const autoRenew = privateSubscription?.autoRenew ? translate('subscription.subscriptionSettings.on') : translate('subscription.subscriptionSettings.off');
    const expensifyCode = isSecretPromoCode ? '' : (privatePromoCode ?? '');

    return (
        <View>
            <View style={styles.mhn5}>
                <MenuItemField
                    name={translate('subscription.subscriptionSettings.title')}
                    value={translate('subscription.subscriptionSettings.summary', subscriptionType, subscriptionSize, expensifyCode, autoRenew, autoIncrease)}
                    numberOfLinesValue={3}
                />
            </View>
            <View style={styles.mt2}>
                <Button
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SETTINGS_DETAILS)}
                    style={styles.alignSelfStart}
                >
                    <Button.Text>{translate('subscription.subscriptionSettings.editSubscription')}</Button.Text>
                </Button>
            </View>
        </View>
    );
}

export default SubscriptionPlanCardActionButton;
