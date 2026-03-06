import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Button from '@components/Button';
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type Props = {
    buttonDisabled?: boolean;
    onUpgrade: () => void;
};

function UpgradeIntro({onUpgrade, buttonDisabled}: Props) {
    const styles = useThemeStyles();
    const {isExtraSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const subscriptionPlan = useSubscriptionPlan();
    const preferredCurrency = usePreferredCurrency();

    const getFormattedPrice = () => {
        const upgradeCurrency = Object.hasOwn(CONST.SUBSCRIPTION_PRICES, preferredCurrency) ? preferredCurrency : CONST.PAYMENT_CARD_CURRENCY.USD;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return `${convertToShortDisplayString(
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            CONST.SUBSCRIPTION_PRICES[upgradeCurrency][CONST.POLICY.TYPE.TEAM][CONST.SUBSCRIPTION.TYPE.ANNUAL],
            upgradeCurrency,
        )} `;
    };

    const formattedPrice = getFormattedPrice();

    const illustrations = useMemoizedLazyIllustrations(['CompanyCard']);
    const illustrationIcons = useMemoizedLazyExpensifyIcons(['Unlock']);

    const getSubscriptionLink = () => {
        if (!subscriptionPlan) {
            return CONST.PLAN_TYPES_AND_PRICING_HELP_URL;
        }
        const currentRoute = Navigation.getActiveRoute();
        return `${environmentURL}/${ROUTES.SETTINGS_SUBSCRIPTION.getRoute(currentRoute)}`;
    };

    const subscriptionLink = getSubscriptionLink();

    return (
        <View style={styles.p5}>
            <View style={[styles.highlightBG, styles.br4, styles.workspaceUpgradeIntroBox({isExtraSmallScreenWidth})]}>
                <View style={[styles.mb3, styles.flexRow, styles.justifyContentBetween]}>
                    <Icon
                        src={illustrations.CompanyCard}
                        width={48}
                        height={48}
                    />
                    <Badge
                        icon={illustrationIcons.Unlock}
                        text={translate('workspace.upgrade.upgradeToUnlock')}
                        success
                    />
                </View>
                <View style={styles.mb5}>
                    <Text style={[styles.textHeadlineH1, styles.mb4]}>{translate('personalCard.addAdditionalCards')}</Text>
                    <Text style={[styles.textNormal, styles.textSupporting, styles.mb4]}>{translate('personalCard.upgradeDescription')}</Text>
                    <View style={[styles.renderHTML]}>
                        <RenderHTML html={translate('personalCard.onlyAvailableOnPlan', {formattedPrice})} />
                    </View>
                </View>
                <Button
                    text={translate('onboarding.workspace.createWorkspace')}
                    testID="upgrade-button"
                    success
                    onPress={onUpgrade}
                    isDisabled={buttonDisabled}
                    large
                />
            </View>
            <View style={[styles.mt6, styles.renderHTML]}>
                <RenderHTML html={translate('personalCard.note', {subscriptionLink})} />
            </View>
        </View>
    );
}

export default UpgradeIntro;
