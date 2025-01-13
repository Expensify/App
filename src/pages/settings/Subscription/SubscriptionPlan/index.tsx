import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCurrentUserAccountID} from '@libs/actions/Report';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {getOwnedPaidPolicies} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SaveWithExpensifyButton from './SaveWithExpensifyButton';
import SubscriptionPlanCard from './SubscriptionPlanCard';
import type {PersonalPolicyTypeExludedProps} from './SubscriptionPlanCard';

function SubscriptionPlan() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const currentUserAccountID = getCurrentUserAccountID();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const subscriptionPlan = useSubscriptionPlan();
    const ownerPolicies = useMemo(() => getOwnedPaidPolicies(policies, currentUserAccountID), [policies, currentUserAccountID]);
    const preferredCurrency = usePreferredCurrency();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;

    function getSubscriptionPrice(plan: PersonalPolicyTypeExludedProps): number {
        if (!privateSubscription?.type) {
            return 0;
        }

        return CONST.SUBSCRIPTION_PRICES[preferredCurrency][plan][privateSubscription.type];
    }

    const plans = [
        {
            type: CONST.POLICY.TYPE.TEAM,
            title: translate('subscription.yourPlan.collect.title'),
            benefits: [
                translate('subscription.yourPlan.collect.benefit1'),
                translate('subscription.yourPlan.collect.benefit2'),
                translate('subscription.yourPlan.collect.benefit3'),
                translate('subscription.yourPlan.collect.benefit4'),
                translate('subscription.yourPlan.collect.benefit5'),
                translate('subscription.yourPlan.collect.benefit6'),
                translate('subscription.yourPlan.collect.benefit7'),
            ],
            src: Illustrations.Mailbox,
            description: translate(`subscription.yourPlan.collect.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`, {
                lower: convertToShortDisplayString(getSubscriptionPrice(CONST.POLICY.TYPE.TEAM), preferredCurrency),
                upper: convertToShortDisplayString(getSubscriptionPrice(CONST.POLICY.TYPE.TEAM) * CONST.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
            }),
            isSelected: subscriptionPlan === CONST.POLICY.TYPE.TEAM,
        },
        {
            type: CONST.POLICY.TYPE.CORPORATE,
            title: translate('subscription.yourPlan.control.title'),
            benefits: [
                translate('subscription.yourPlan.control.benefit1'),
                translate('subscription.yourPlan.control.benefit2'),
                translate('subscription.yourPlan.control.benefit3'),
                translate('subscription.yourPlan.control.benefit4'),
                translate('subscription.yourPlan.control.benefit5'),
                translate('subscription.yourPlan.control.benefit6'),
            ],
            src: Illustrations.ShieldYellow,
            description: translate(`subscription.yourPlan.control.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`, {
                lower: convertToShortDisplayString(getSubscriptionPrice(CONST.POLICY.TYPE.CORPORATE), preferredCurrency),
                upper: convertToShortDisplayString(getSubscriptionPrice(CONST.POLICY.TYPE.CORPORATE) * CONST.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
            }),
            isSelected: subscriptionPlan === CONST.POLICY.TYPE.CORPORATE,
        },
    ];

    const handlePlanPress = (planType: PersonalPolicyTypeExludedProps) => {
        // If the selected plan and the current plan are the same, and the user has no policies, return.
        if (planType === subscriptionPlan || !ownerPolicies.length) {
            return;
        }

        // If the user has one policy as owner and selected plan is team, navigate to downgrade page.
        if (ownerPolicies.length === 1 && planType === CONST.POLICY.TYPE.TEAM) {
            Navigation.navigate(ROUTES.WORKSPACE_DOWNGRADE.getRoute(ownerPolicies.at(0)?.id));
            return;
        }

        // If the user has one policy as owner and selected plan is corporate, navigate to upgrade page.
        if (ownerPolicies.length === 1 && planType === CONST.POLICY.TYPE.CORPORATE) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(ownerPolicies.at(0)?.id));
            return;
        }

        // If the user has multiple policies as owner and selected plan is team, navigate to downgrade page.
        if (ownerPolicies.length > 1 && planType === CONST.POLICY.TYPE.TEAM) {
            Navigation.navigate(ROUTES.WORKSPACE_DOWNGRADE.getRoute());
            return;
        }

        //  If the user has multiple policies as owner and selected plan is corporate, navigate to upgrade page.
        if (ownerPolicies.length > 1 && planType === CONST.POLICY.TYPE.CORPORATE) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute());
        }
    };

    return (
        <Section
            title={translate('subscription.yourPlan.title')}
            isCentralPane
            titleStyles={styles.textStrong}
        >
            <View style={[shouldUseNarrowLayout ? {} : styles.flexRow]}>
                {plans.map((plan, index) => (
                    <SubscriptionPlanCard
                        key={plan.type}
                        index={index}
                        plan={plan}
                        onPress={handlePlanPress}
                    />
                ))}
            </View>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt6]}>
                <Icon
                    src={Illustrations.HandCard}
                    width={variables.iconHeader}
                    height={variables.iconHeader}
                    additionalStyles={styles.mr2}
                />
                <View style={[styles.flexColumn, styles.justifyContentCenter, styles.flex1, styles.mr2]}>
                    <Text style={[styles.headerText, styles.mt2]}>{translate('subscription.yourPlan.saveWithExpensifyTitle')}</Text>
                    <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('subscription.yourPlan.saveWithExpensifyDescription')}</Text>
                </View>
                <SaveWithExpensifyButton />
            </View>
        </Section>
    );
}

SubscriptionPlan.displayName = 'SubscriptionPlan';

export default SubscriptionPlan;
