import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicon from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';
import {openLink} from '@libs/actions/Link';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import GenericFeaturesView from './GenericFeaturesView';

type Props = {
    buttonDisabled?: boolean;
    loading?: boolean;
    feature?: ValueOf<typeof CONST.UPGRADE_FEATURE_INTRO_MAPPING>;
    onUpgrade: () => void;
    isCategorizing?: boolean;
};

function UpgradeIntro({feature, onUpgrade, buttonDisabled, loading, isCategorizing}: Props) {
    const styles = useThemeStyles();
    const {isExtraSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const subscriptionPlan = useSubscriptionPlan();
    const preferredCurrency = usePreferredCurrency();

    const formattedPrice = React.useMemo(() => {
        const upgradePlan = isCategorizing ? CONST.POLICY.TYPE.TEAM : CONST.POLICY.TYPE.CORPORATE;
        const upgradeCurrency = Object.hasOwn(CONST.SUBSCRIPTION_PRICES, preferredCurrency) ? preferredCurrency : CONST.PAYMENT_CARD_CURRENCY.USD;
        const upgradePrice = CONST.SUBSCRIPTION_PRICES[upgradeCurrency][upgradePlan][CONST.SUBSCRIPTION.TYPE.ANNUAL];
        return `${convertToShortDisplayString(upgradePrice, upgradeCurrency)} `;
    }, [preferredCurrency, isCategorizing]);

    if (!feature) {
        return (
            <GenericFeaturesView
                onUpgrade={onUpgrade}
                buttonDisabled={buttonDisabled}
                loading={loading}
            />
        );
    }

    const isIllustration = feature.icon in Illustrations;
    const iconSrc = isIllustration ? Illustrations[feature.icon as keyof typeof Illustrations] : Expensicon[feature.icon as keyof typeof Expensicon];
    const iconAdditionalStyles = feature.id === CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id ? styles.br0 : undefined;

    return (
        <View style={styles.p5}>
            <View style={styles.workspaceUpgradeIntroBox({isExtraSmallScreenWidth})}>
                <View style={[styles.mb3, styles.flexRow, styles.justifyContentBetween]}>
                    {!isIllustration ? (
                        <Avatar
                            source={iconSrc}
                            type={CONST.ICON_TYPE_AVATAR}
                        />
                    ) : (
                        <Icon
                            src={iconSrc}
                            width={48}
                            height={48}
                            additionalStyles={iconAdditionalStyles}
                        />
                    )}
                    <Badge
                        icon={Expensicon.Unlock}
                        text={translate('workspace.upgrade.upgradeToUnlock')}
                        success
                    />
                </View>
                <View style={styles.mb5}>
                    <Text style={[styles.textHeadlineH1, styles.mb4]}>{translate(feature.title)}</Text>
                    <Text style={[styles.textNormal, styles.textSupporting, styles.mb4]}>{translate(feature.description)}</Text>
                    <Text style={[styles.textNormal, styles.textSupporting]}>
                        {translate(`workspace.upgrade.${feature.id}.onlyAvailableOnPlan`)}
                        <Text style={[styles.textSupporting, styles.textBold]}>{formattedPrice}</Text>
                        {translate(`workspace.upgrade.pricing.perActiveMember`)}
                    </Text>
                </View>
                <Button
                    isLoading={loading}
                    text={translate('common.upgrade')}
                    testID="upgrade-button"
                    success
                    onPress={onUpgrade}
                    isDisabled={buttonDisabled}
                    large
                />
            </View>
            <View style={styles.mt6}>
                <Text style={[styles.textNormal, styles.textSupporting]}>
                    {translate('workspace.upgrade.note.upgradeWorkspace')}{' '}
                    <TextLink
                        style={[styles.link]}
                        onPress={() => {
                            if (!subscriptionPlan) {
                                openLink(CONST.PLAN_TYPES_AND_PRICING_HELP_URL, environmentURL);
                                return;
                            }
                            Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION);
                        }}
                    >
                        {translate('workspace.upgrade.note.learnMore')}
                    </TextLink>{' '}
                    {translate('workspace.upgrade.note.aboutOurPlans')}
                </Text>
            </View>
        </View>
    );
}

export default UpgradeIntro;
