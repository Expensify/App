import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import SaveWithExpensifyButton from './SaveWithExpensifyButton';

function SubscriptionPlan() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const subscriptionPlan = useSubscriptionPlan();

    const isCollect = subscriptionPlan === CONST.POLICY.TYPE.TEAM;
    // TODO: replace this with a real value once OpenSubscriptionPage API command is implemented
    const isAnnual = true;

    const benefitsList = isCollect
        ? [
              translate('subscription.yourPlan.collect.benefit1'),
              translate('subscription.yourPlan.collect.benefit2'),
              translate('subscription.yourPlan.collect.benefit3'),
              translate('subscription.yourPlan.collect.benefit4'),
              translate('subscription.yourPlan.collect.benefit5'),
              translate('subscription.yourPlan.collect.benefit6'),
          ]
        : [
              translate('subscription.yourPlan.control.benefit1'),
              translate('subscription.yourPlan.control.benefit2'),
              translate('subscription.yourPlan.control.benefit3'),
              translate('subscription.yourPlan.control.benefit4'),
              translate('subscription.yourPlan.control.benefit5'),
              translate('subscription.yourPlan.control.benefit6'),
              translate('subscription.yourPlan.control.benefit7'),
          ];

    let priceInfo;

    if (isCollect) {
        priceInfo = translate(`subscription.yourPlan.collect.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`);
    } else {
        priceInfo = translate(`subscription.yourPlan.control.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`);
    }

    return (
        <Section
            title={translate('subscription.yourPlan.title')}
            isCentralPane
            titleStyles={styles.subscriptionSettingsSectionTitle}
        >
            <View style={[styles.subscriptionSettingsBorderWrapper, styles.mt5, styles.p5]}>
                <Icon
                    src={isCollect ? Illustrations.Mailbox : Illustrations.ShieldYellow}
                    width={variables.iconHeader}
                    height={variables.iconHeader}
                />
                <Text style={[styles.yourPlanTitle, styles.mt2]}>{isCollect ? translate('subscription.yourPlan.collect.title') : translate('subscription.yourPlan.control.title')}</Text>
                <Text style={[styles.yourPlanSubtitle, styles.mb2]}>{priceInfo}</Text>
                {benefitsList.map((benefit) => (
                    <View
                        style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}
                        key={benefit}
                    >
                        <Icon
                            src={Expensicons.Checkmark}
                            fill={theme.iconSuccessFill}
                        />
                        <Text style={[styles.yourPlanBenefit, styles.ml2]}>{benefit}</Text>
                    </View>
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
                    <Text style={[styles.yourPlanTitle, styles.mt2]}>{translate('subscription.yourPlan.saveWithExpensifyTitle')}</Text>
                    <Text style={[styles.yourPlanSubtitle, styles.mb2]}>{translate('subscription.yourPlan.saveWithExpensifyDescription')}</Text>
                </View>
                <SaveWithExpensifyButton />
            </View>
        </Section>
    );
}

export default SubscriptionPlan;
