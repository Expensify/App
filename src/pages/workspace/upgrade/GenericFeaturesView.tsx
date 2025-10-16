import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

type GenericFeaturesViewProps = {
    buttonDisabled?: boolean;
    loading?: boolean;
    onUpgrade: () => void;
    formattedPrice: string;
    policyID?: string;
    backTo?: Route;
};

function GenericFeaturesView({onUpgrade, buttonDisabled, loading, formattedPrice, backTo, policyID}: GenericFeaturesViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isExtraSmallScreenWidth} = useResponsiveLayout();
    const hasTeam2025Pricing = useHasTeam2025Pricing();

    const benefits = [
        translate('workspace.upgrade.commonFeatures.benefits.benefit1'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit2'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit3'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit4'),
    ];

    return (
        <View style={[styles.m5, styles.highlightBG, styles.br4, styles.workspaceUpgradeIntroBox({isExtraSmallScreenWidth})]}>
            <View style={[styles.mb3]}>
                <Icon
                    src={Illustrations.ShieldYellow}
                    width={48}
                    height={48}
                />
            </View>
            <View style={policyID ? styles.mb5 : styles.mb4}>
                <Text style={[styles.textHeadlineH1, styles.mb4]}>{translate('workspace.upgrade.commonFeatures.title')}</Text>
                <Text style={[styles.textNormal, styles.textSupporting, styles.mb4]}>{translate('workspace.upgrade.commonFeatures.note')}</Text>
                {benefits.map((benefit) => (
                    <View
                        key={benefit}
                        style={[styles.pl2, styles.flexRow]}
                    >
                        <Text style={[styles.textNormal, styles.textSupporting, styles.mr1]}>•</Text>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{benefit}</Text>
                    </View>
                ))}
                <Text style={[styles.textNormal, styles.textSupporting, styles.mt4]}>
                    {translate('workspace.upgrade.commonFeatures.benefits.startsAt')}
                    <Text style={[styles.textSupporting, styles.textBold]}>{formattedPrice}</Text>
                    {hasTeam2025Pricing ? translate('workspace.upgrade.pricing.perMember') : translate('workspace.upgrade.pricing.perActiveMember')}{' '}
                    <TextLink
                        style={[styles.link]}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.getRoute(Navigation.getActiveRoute()))}
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
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACES_LIST.getRoute(backTo ?? Navigation.getActiveRoute()), {forceReplace: true})}
                    large
                />
            )}
        </View>
    );
}
export default GenericFeaturesView;
