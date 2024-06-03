import {format} from 'date-fns';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';

function SubscriptionSettingsSection() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    // TODO these values will come from API in next phase
    const isAutoRenewOn = true;
    const isAutoIncreaseOn = false;
    const isCorporateKarmaOn = true;

    // TODO this will come from API in next phase
    const isCollectPlan = true;
    // TODO this will come from API in next phase
    const expirationDate = format(new Date(), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT);

    // TODO all actions will be implemented in next phase
    const handleAutoRenewToggle = () => {};
    const handleAutoIncreaseToggle = () => {};
    const handleCorporateKarmaToggle = () => {};

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
            {isCollectPlan ? (
                <>
                    <View style={[styles.mt5]}>
                        <ToggleSettingOptionRow
                            title={translate('subscription.subscriptionSettings.autoRenew')}
                            switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')}
                            onToggle={handleAutoRenewToggle}
                            isActive={isAutoRenewOn}
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('subscription.subscriptionSettings.renewsOn', {date: expirationDate})}</Text>
                    </View>
                    <View style={[styles.mt3]}>
                        <ToggleSettingOptionRow
                            customTitle={customTitle}
                            switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')}
                            onToggle={handleAutoIncreaseToggle}
                            isActive={isAutoIncreaseOn}
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('subscription.subscriptionSettings.automaticallyIncrease')}</Text>
                    </View>
                </>
            ) : (
                <View style={[styles.mt5]}>
                    <ToggleSettingOptionRow
                        title={translate('subscription.subscriptionSettings.corporateKarma')}
                        switchAccessibilityLabel={translate('subscription.subscriptionSettings.corporateKarma')}
                        onToggle={handleCorporateKarmaToggle}
                        isActive={isCorporateKarmaOn}
                    />
                    <View style={[styles.flexRow, styles.mt2, styles.alignItemsCenter]}>
                        <Text style={[styles.mutedTextLabel, styles.mr1]}>{translate('subscription.subscriptionSettings.donateToExpensify')}</Text>
                        <TextLink
                            style={[styles.label]}
                            href={CONST.CORPORATE_KARMA_URL}
                        >
                            {translate('common.learnMore')}
                        </TextLink>
                    </View>
                </View>
            )}
        </Section>
    );
}

SubscriptionSettingsSection.displayName = 'SubscriptionSettingsSection';

export default SubscriptionSettingsSection;
