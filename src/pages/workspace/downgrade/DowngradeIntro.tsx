import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {openLink} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

type Props = {
    buttonDisabled?: boolean;
    loading?: boolean;
    onDowngrade: () => void;
    policyID?: string;
    backTo?: Route;
};

function DowngradeIntro({onDowngrade, buttonDisabled, loading, policyID, backTo}: Props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const {isExtraSmallScreenWidth} = useResponsiveLayout();

    const illustrations = useMemoizedLazyIllustrations(['Mailbox'] as const);

    const benefits = [
        translate('workspace.downgrade.commonFeatures.benefits.benefit1'),
        translate('workspace.downgrade.commonFeatures.benefits.benefit2'),
        translate('workspace.downgrade.commonFeatures.benefits.benefit3'),
        translate('workspace.downgrade.commonFeatures.benefits.benefit4'),
    ];

    return (
        <View style={[styles.m5, styles.highlightBG, styles.br4, styles.workspaceUpgradeIntroBox({isExtraSmallScreenWidth})]}>
            <View style={[styles.mb3]}>
                <Icon
                    src={illustrations.Mailbox}
                    width={48}
                    height={48}
                />
            </View>
            <View style={styles.mb5}>
                <Text style={[styles.textHeadlineH1, styles.mb4]}>{translate('workspace.downgrade.commonFeatures.title')}</Text>
                <Text style={[styles.textNormal, styles.textSupporting, styles.mb4]}>{translate('workspace.downgrade.commonFeatures.note')}</Text>
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
                    {translate('workspace.downgrade.commonFeatures.benefits.note')}{' '}
                    <TextLink
                        style={[styles.link]}
                        onPress={() => openLink(CONST.PLAN_TYPES_AND_PRICING_HELP_URL, environmentURL)}
                    >
                        {translate('workspace.downgrade.commonFeatures.benefits.pricingPage')}
                    </TextLink>
                    .
                </Text>
                {policyID ? (
                    <Text style={[styles.mv4]}>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.confirm')}</Text>{' '}
                        <Text style={[styles.textBold, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.warning')}</Text>
                    </Text>
                ) : (
                    <Text style={[styles.mv4]}>
                        <Text style={[styles.textBold, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.headsUp')}</Text>{' '}
                        <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.multiWorkspaceNote')}</Text>{' '}
                        <Text style={[styles.textBold, styles.textSupporting]}>{translate('workspace.common.goToWorkspaces')}</Text>{' '}
                        <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.selectStep')}</Text>{' '}
                        <Text style={[styles.textBold, styles.textSupporting]}>{translate('workspace.type.collect')}</Text>.
                    </Text>
                )}
            </View>
            {policyID ? (
                <Button
                    isLoading={loading}
                    text={translate('common.downgradeWorkspace')}
                    success
                    onPress={onDowngrade}
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

export default DowngradeIntro;
