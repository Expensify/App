import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import {formatSubscriptionEndDate} from '@pages/settings/Subscription/utils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Subscription from '@userActions/Subscription';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SubscriptionSettings() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const subscriptionPlan = useSubscriptionPlan();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    const isCollect = subscriptionPlan === CONST.POLICY.TYPE.TEAM;

    const autoRenewalDate = formatSubscriptionEndDate(privateSubscription?.endDate);

    const handleAutoRenewToggle = () => {
        if (!privateSubscription?.autoRenew) {
            Subscription.updateSubscriptionAutoRenew(true);
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_DISABLE_AUTO_RENEW_SURVEY);
    };
    const handleAutoIncreaseToggle = () => {
        if (privateSubscription?.addNewUsersAutomatically === undefined) {
            Subscription.updateSubscriptionAddNewUsersAutomatically(true);
        } else {
            Subscription.updateSubscriptionAddNewUsersAutomatically(!privateSubscription.addNewUsersAutomatically);
        }
    };

    if (privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.PAYPERUSE) {
        return null;
    }

    const customTitleSecondSentenceStyles: StyleProp<TextStyle> = [styles.textNormal, {color: theme.success}];
    const customTitle = (
        <View style={[styles.flexRow, styles.flex1, styles.alignItemsCenter]}>
            <Text style={[styles.mr1, styles.textNormalThemeText]}>{translate('subscription.subscriptionSettings.autoIncrease')}</Text>
            <Text style={customTitleSecondSentenceStyles}>
                {translate('subscription.subscriptionSettings.saveUpTo', {
                    amountSaved: isCollect ? CONST.SUBSCRIPTION_POSSIBLE_COST_SAVINGS.COLLECT_PLAN : CONST.SUBSCRIPTION_POSSIBLE_COST_SAVINGS.CONTROL_PLAN,
                })}
            </Text>
        </View>
    );

    return (
        <Section
            title={translate('subscription.subscriptionSettings.title')}
            titleStyles={styles.textStrong}
            isCentralPane
        >
            <OfflineWithFeedback pendingAction={privateSubscription?.pendingAction}>
                <View style={styles.mt5}>
                    <ToggleSettingOptionRow
                        title={translate('subscription.subscriptionSettings.autoRenew')}
                        switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')}
                        onToggle={handleAutoRenewToggle}
                        isActive={privateSubscription?.autoRenew ?? false}
                    />
                    {!!autoRenewalDate && <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('subscription.subscriptionSettings.renewsOn', {date: autoRenewalDate})}</Text>}
                </View>
                <View style={styles.mt3}>
                    <ToggleSettingOptionRow
                        customTitle={customTitle}
                        switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')}
                        onToggle={handleAutoIncreaseToggle}
                        isActive={privateSubscription?.addNewUsersAutomatically ?? false}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('subscription.subscriptionSettings.automaticallyIncrease')}</Text>
                </View>
            </OfflineWithFeedback>
        </Section>
    );
}

SubscriptionSettings.displayName = 'SubscriptionSettings';

export default SubscriptionSettings;
