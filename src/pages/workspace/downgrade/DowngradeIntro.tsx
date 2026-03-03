import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
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

    const illustrations = useMemoizedLazyIllustrations(['Mailbox']);

    const benefitsNoteHTML = useMemo(() => {
        const note = translate('workspace.downgrade.commonFeatures.note');
        const noteAndMore = translate('workspace.downgrade.commonFeatures.noteAndMore');
        const pricingPageUrl = CONST.PLAN_TYPES_AND_PRICING_HELP_URL;
        return `<muted-text>${note}<a href="${pricingPageUrl}">${noteAndMore}</a></muted-text>`;
    }, [translate]);

    const benefitsListHTML = useMemo(() => {
        const benefits = [
            {
                label: translate('workspace.downgrade.commonFeatures.benefits.benefit1Label'),
                value: translate('workspace.downgrade.commonFeatures.benefits.benefit1'),
            },
            {
                label: translate('workspace.downgrade.commonFeatures.benefits.benefit2Label'),
                value: translate('workspace.downgrade.commonFeatures.benefits.benefit2'),
            },
            {
                label: translate('workspace.downgrade.commonFeatures.benefits.benefit3Label'),
                value: translate('workspace.downgrade.commonFeatures.benefits.benefit3'),
            },
            {
                label: translate('workspace.downgrade.commonFeatures.benefits.benefit4Label'),
                value: translate('workspace.downgrade.commonFeatures.benefits.benefit4'),
            },
        ];
        const listItems = benefits.map(({label, value}) => `• <strong>${label}:</strong> ${value}`).join('<br/>');
        return `<muted-text>${listItems}</muted-text>`;
    }, [translate]);

    const handleLinkPress = useMemo(
        () => () => {
            openLink(CONST.PLAN_TYPES_AND_PRICING_HELP_URL, environmentURL);
        },
        [environmentURL],
    );

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
                <View style={[styles.mb4, styles.pb2]}>
                    <RenderHTML
                        html={benefitsNoteHTML}
                        onLinkPress={handleLinkPress}
                    />
                </View>
                <View style={[styles.mb4, styles.pt2, styles.pb2, styles.pl2]}>
                    <RenderHTML html={benefitsListHTML} />
                </View>
                <Text style={[styles.mv4, styles.textBold, styles.textSupporting]}>
                    {translate('workspace.downgrade.commonFeatures.benefits.important')}
                    {translate('workspace.downgrade.commonFeatures.benefits.confirm')}
                </Text>
                {!policyID && (
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
