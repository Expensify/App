import {format} from 'date-fns';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SubscriptionSettingsSection() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    // TODO these default state values will come from API in next phase
    const [autoRenew, setAutoRenew] = useState(true);
    const [autoIncrease, setAutoIncrease] = useState(false);

    // TODO this will come from API in next phase
    const expirationDate = format(new Date(), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT);

    // TODO all actions will be implemented in next phase
    const handleAutoRenewToggle = () => {
        if (!autoRenew) {
            // TODO make API call to enable auto renew here
            setAutoRenew(true);
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_DISABLE_AUTO_RENEW_SURVEY);
    };
    const handleAutoIncreaseToggle = () => {
        // TODO make API call to toggle auto increase here
        setAutoIncrease(!autoIncrease);
    };

    const customTitle = useMemo(() => {
        const customTitleSecondSentenceStyles = [styles.textNormal, {color: theme.success}];

        return (
            <View style={[styles.flexRow, styles.flex1, styles.alignItemsCenter]}>
                <Text style={[styles.mr1, styles.textNormalThemeText]}>{translate('subscription.subscriptionSettings.autoIncrease')}</Text>
                <Text style={customTitleSecondSentenceStyles}>{translate('subscription.subscriptionSettings.saveUpTo')}</Text>
            </View>
        );
    }, [styles.alignItemsCenter, styles.flex1, styles.flexRow, styles.mr1, styles.textNormal, styles.textNormalThemeText, theme.success, translate]);

    return (
        <Section
            title={translate('subscription.subscriptionSettings.title')}
            titleStyles={[styles.textStrong]}
            isCentralPane
        >
            <View style={[styles.mt5]}>
                <ToggleSettingOptionRow
                    title={translate('subscription.subscriptionSettings.autoRenew')}
                    switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')}
                    onToggle={handleAutoRenewToggle}
                    isActive={autoRenew}
                />
                <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('subscription.subscriptionSettings.renewsOn', {date: expirationDate})}</Text>
            </View>
            <View style={[styles.mt3]}>
                <ToggleSettingOptionRow
                    customTitle={customTitle}
                    switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')}
                    onToggle={handleAutoIncreaseToggle}
                    isActive={autoIncrease}
                />
                <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('subscription.subscriptionSettings.automaticallyIncrease')}</Text>
            </View>
        </Section>
    );
}

SubscriptionSettingsSection.displayName = 'SubscriptionSettingsSection';

export default SubscriptionSettingsSection;
