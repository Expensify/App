import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useSubscriptionPossibleCostSavings from '@hooks/useSubscriptionPossibleCostSavings';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
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
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const preferredCurrency = usePreferredCurrency();
    const possibleCostSavings = useSubscriptionPossibleCostSavings();

    const autoRenewalDate = formatSubscriptionEndDate(privateSubscription?.endDate);

    const handleAutoRenewToggle = () => {
        if (!privateSubscription?.autoRenew) {
            Subscription.updateSubscriptionAutoRenew(true);
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_DISABLE_AUTO_RENEW_SURVEY);
    };

    const handleAutoIncreaseToggle = () => {
        Subscription.updateSubscriptionAddNewUsersAutomatically(!privateSubscription?.addNewUsersAutomatically);
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
                    amountWithCurrency: convertToShortDisplayString(possibleCostSavings, preferredCurrency),
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
            <OfflineWithFeedback pendingAction={privateSubscription?.pendingFields?.autoRenew}>
                <View style={styles.mt5}>
                    <ToggleSettingOptionRow
                        title={translate('subscription.subscriptionSettings.autoRenew')}
                        switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')}
                        onToggle={handleAutoRenewToggle}
                        isActive={privateSubscription?.autoRenew ?? false}
                    />
                    {!!autoRenewalDate && <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('subscription.subscriptionSettings.renewsOn', {date: autoRenewalDate})}</Text>}
                </View>
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={privateSubscription?.pendingFields?.addNewUsersAutomatically}>
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
