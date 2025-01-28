import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type GenericFeaturesViewProps = {
    buttonDisabled?: boolean;
    loading?: boolean;
    onUpgrade: () => void;
    policyID?: string;
};

function GenericFeaturesView({onUpgrade, buttonDisabled, loading, policyID}: GenericFeaturesViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isExtraSmallScreenWidth} = useResponsiveLayout();
    const preferredCurrency = usePreferredCurrency();

    const benefits = [
        translate('workspace.upgrade.commonFeatures.benefits.benefit1'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit2'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit3'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit4'),
    ];

    const formattedPrice = React.useMemo(() => {
        const upgradeCurrency = Object.hasOwn(CONST.SUBSCRIPTION_PRICES, preferredCurrency) ? preferredCurrency : CONST.PAYMENT_CARD_CURRENCY.USD;
        const upgradePrice = CONST.SUBSCRIPTION_PRICES[upgradeCurrency][CONST.POLICY.TYPE.CORPORATE][CONST.SUBSCRIPTION.TYPE.ANNUAL];
        return `${convertToShortDisplayString(upgradePrice, upgradeCurrency)} `;
    }, [preferredCurrency]);

    return (
        <View style={[styles.m5, styles.workspaceUpgradeIntroBox({isExtraSmallScreenWidth})]}>
            <View style={[styles.mb3]}>
                <Icon
                    src={Illustrations.ShieldYellow}
                    width={48}
                    height={48}
                />
            </View>
            <View style={styles.mb4}>
                <Text style={[styles.textHeadlineH1, styles.mb4]}>{translate('workspace.upgrade.commonFeatures.title')}</Text>
                <Text style={[styles.textNormal, styles.textSupporting, styles.mb4]}>{translate('workspace.upgrade.commonFeatures.note')}</Text>
                {benefits.map((benefit) => (
                    <View
                        key={benefit}
                        style={[styles.pl2, styles.flexRow]}
                    >
                        <Text style={[styles.textNormal, styles.textSupporting]}>• </Text>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{benefit}</Text>
                    </View>
                ))}
                <Text style={[styles.textNormal, styles.textSupporting, styles.mt4]}>
                    {translate('workspace.upgrade.commonFeatures.benefits.startsAt')}
                    <Text style={[styles.textSupporting, styles.textBold]}>{formattedPrice}</Text>
                    {translate('workspace.upgrade.commonFeatures.benefits.perMember')}{' '}
                    <TextLink
                        style={[styles.link]}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION)}
                    >
                        {translate('workspace.upgrade.commonFeatures.benefits.learnMore')}
                    </TextLink>{' '}
                    {translate('workspace.upgrade.commonFeatures.benefits.pricing')}
                </Text>
            </View>
            {!policyID && (
                <Text style={[styles.mb5, styles.textNormal, styles.textSupporting]}>
                    <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.upgrade.commonFeatures.benefits.toUpgrade')}</Text>{' '}
                    <Text style={[styles.textBold, styles.textSupporting]}>{translate('workspace.common.goToWorkspaces')}</Text>,{' '}
                    <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.upgrade.commonFeatures.benefits.selectWorkspace')}</Text>{' '}
                    <Text style={[styles.textBold, styles.textSupporting]}>{translate('workspace.type.control')}</Text>.
                </Text>
            )}
            {policyID ? (
                <Button
                    isLoading={loading}
                    text={translate('common.upgrade')}
                    success
                    onPress={onUpgrade}
                    isDisabled={buttonDisabled}
                    large
                />
            ) : (
                <Button
                    text={translate('workspace.common.goToWorkspaces')}
                    success
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES, CONST.NAVIGATION.TYPE.UP)}
                    large
                />
            )}
        </View>
    );
}
export default GenericFeaturesView;
