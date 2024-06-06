import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
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
import ONYXKEYS from '@src/ONYXKEYS';
import SaveWithExpensifyButton from './SaveWithExpensifyButton';

function SubscriptionPlan() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const subscriptionPlan = useSubscriptionPlan();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    const isCollect = subscriptionPlan === CONST.POLICY.TYPE.TEAM;
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;

    const benefitsList = isCollect
        ? [
              translate('subscription.yourPlan.collect.benefit1'),
              translate('subscription.yourPlan.collect.benefit2'),
              translate('subscription.yourPlan.collect.benefit3'),
              translate('subscription.yourPlan.collect.benefit4'),
              translate('subscription.yourPlan.collect.benefit5'),
              translate('subscription.yourPlan.collect.benefit6'),
              translate('subscription.yourPlan.collect.benefit7'),
          ]
        : [
              translate('subscription.yourPlan.control.benefit1'),
              translate('subscription.yourPlan.control.benefit2'),
              translate('subscription.yourPlan.control.benefit3'),
              translate('subscription.yourPlan.control.benefit4'),
              translate('subscription.yourPlan.control.benefit5'),
              translate('subscription.yourPlan.control.benefit6'),
          ];

    return (
        <Section
            title={translate('subscription.yourPlan.title')}
            isCentralPane
            titleStyles={styles.textStrong}
        >
            <View style={[styles.borderedContentCard, styles.mt5, styles.p5]}>
                <Icon
                    src={isCollect ? Illustrations.Mailbox : Illustrations.ShieldYellow}
                    width={variables.iconHeader}
                    height={variables.iconHeader}
                />
                <Text style={[styles.headerText, styles.mt2]}>{translate(`subscription.yourPlan.${isCollect ? 'collect' : 'control'}.title`)}</Text>
                <Text style={[styles.textLabelSupporting, styles.mb2]}>
                    {translate(`subscription.yourPlan.${isCollect ? 'collect' : 'control'}.${isAnnual ? 'priceAnnual' : 'pricePayPerUse'}`)}
                </Text>
                {benefitsList.map((benefit) => (
                    <View
                        style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}
                        key={benefit}
                    >
                        <Icon
                            src={Expensicons.Checkmark}
                            fill={theme.iconSuccessFill}
                            width={variables.iconSizeSmall}
                            height={variables.iconSizeSmall}
                        />
                        <Text style={[styles.textMicroSupporting, styles.ml2]}>{benefit}</Text>
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
