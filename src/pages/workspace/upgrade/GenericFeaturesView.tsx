import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

type GenericFeaturesViewProps = {
    buttonDisabled?: boolean;
    loading?: boolean;
    onUpgrade: () => void;
    formattedPrice: string;
    policyID?: string;
    backTo?: Route;
    /** Target plan the user chose to upgrade to. When Collect (TEAM), render Collect copy instead of the default Control copy */
    upgradePlanType?: ValueOf<typeof CONST.POLICY.TYPE>;
};

function GenericFeaturesView({onUpgrade, buttonDisabled, loading, formattedPrice, backTo, policyID, upgradePlanType}: GenericFeaturesViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const learnMoreMethodsRoute = `${environmentURL}/${ROUTES.SETTINGS_SUBSCRIPTION.getRoute(Navigation.getActiveRoute())}`;
    const {asset: ShieldYellow} = useMemoizedLazyAsset(() => loadIllustration('ShieldYellow' as IllustrationName));
    const {isExtraSmallScreenWidth} = useResponsiveLayout();
    const hasTeam2025Pricing = useHasTeam2025Pricing();

    const isCollectUpgrade = upgradePlanType === CONST.POLICY.TYPE.TEAM;
    const title = isCollectUpgrade ? translate('workspace.upgrade.commonFeatures.collect.title') : translate('workspace.upgrade.commonFeatures.title');
    const startsAtFull = isCollectUpgrade
        ? translate('workspace.upgrade.commonFeatures.collect.startsAtFull', learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing)
        : translate('workspace.upgrade.commonFeatures.benefits.startsAtFull', learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing);
    const note = isCollectUpgrade ? translate('workspace.upgrade.commonFeatures.collect.note') : translate('workspace.upgrade.commonFeatures.note');

    const benefits = isCollectUpgrade
        ? [
              translate('subscription.yourPlan.collect.benefit1'),
              translate('subscription.yourPlan.collect.benefit2'),
              translate('subscription.yourPlan.collect.benefit3'),
              translate('subscription.yourPlan.collect.benefit4'),
          ]
        : [
              translate('workspace.upgrade.commonFeatures.benefits.benefit1'),
              translate('workspace.upgrade.commonFeatures.benefits.benefit2'),
              translate('workspace.upgrade.commonFeatures.benefits.benefit3'),
              translate('workspace.upgrade.commonFeatures.benefits.benefit4'),
          ];

    return (
        <View style={[styles.m5, styles.highlightBG, styles.br4, styles.workspaceUpgradeIntroBox({isExtraSmallScreenWidth})]}>
            <View style={[styles.mb3]}>
                <Icon
                    src={ShieldYellow}
                    width={48}
                    height={48}
                />
            </View>
            <View style={policyID ? styles.mb5 : styles.mb4}>
                <Text style={[styles.textHeadlineH1, styles.mb4]}>{title}</Text>
                <Text style={[styles.textNormal, styles.textSupporting, styles.mb4]}>{note}</Text>
                {benefits.map((benefit) => (
                    <View
                        key={benefit}
                        style={[styles.pl2, styles.flexRow]}
                    >
                        <Text style={[styles.textNormal, styles.textSupporting, styles.mr1]}>•</Text>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{benefit}</Text>
                    </View>
                ))}
                <View style={[styles.textNormal, styles.textSupporting, styles.mt4, styles.flexRow]}>
                    <RenderHTML html={startsAtFull} />
                </View>
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
                    variant="success"
                    onPress={onUpgrade}
                    isDisabled={buttonDisabled}
                    size={CONST.BUTTON_SIZE.LARGE}
                >
                    <Button.Text>{translate('common.upgrade')}</Button.Text>
                </Button>
            ) : (
                <Button
                    variant="success"
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACES_LIST.getRoute(backTo ?? Navigation.getActiveRoute()), {forceReplace: true})}
                    size={CONST.BUTTON_SIZE.LARGE}
                >
                    <Button.Text>{translate('workspace.common.goToWorkspaces')}</Button.Text>
                </Button>
            )}
        </View>
    );
}
export default GenericFeaturesView;
