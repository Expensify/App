import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SaveWithExpensifyButton from './SaveWithExpensifyButton';
import SubscriptionPlanCard from './SubscriptionPlanCard';

function SubscriptionPlan() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const subscriptionPlan = useSubscriptionPlan();

    const preferredCurrency = usePreferredCurrency();

    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;

    function getSubscriptionPrice(plan: Exclude<ValueOf<typeof CONST.POLICY.TYPE>, 'personal'>): number {
        if (!subscriptionPlan || !privateSubscription?.type) {
            return 0;
        }

        return CONST.SUBSCRIPTION_PRICES[preferredCurrency][plan][privateSubscription.type];
    }

    const plans = [
        {
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

    return (
        <Section
            title={translate('subscription.yourPlan.title')}
            isCentralPane
            titleStyles={styles.textStrong}
        >
            <View style={[styles.flexRow]}>
                {plans.map((plan, index) => (
                    <SubscriptionPlanCard
                        index={index}
                        plan={plan}
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
