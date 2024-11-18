import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import BulletList from '@components/BulletList';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicon from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section, {CARD_LAYOUT} from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type Props = {
    buttonDisabled?: boolean;
    loading?: boolean;
    feature?: ValueOf<typeof CONST.UPGRADE_FEATURE_INTRO_MAPPING>;
    onUpgrade: () => void;
};

function UpgradeIntro({feature, onUpgrade, buttonDisabled, loading}: Props) {
    const styles = useThemeStyles();
    const {isExtraSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();

    if (!feature) {
        return (
            <CommonCorporateFeatures
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
                        <Text style={[styles.textSupporting, styles.textBold]}>{translate(`workspace.upgrade.pricing.amount`)}</Text>
                        {translate(`workspace.upgrade.pricing.perActiveMember`)}
                    </Text>
                </View>
                <Button
                    isLoading={loading}
                    text={translate('common.upgrade')}
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
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION)}
                    >
                        {translate('workspace.upgrade.note.learnMore')}
                    </TextLink>{' '}
                    {translate('workspace.upgrade.note.aboutOurPlans')}
                </Text>
            </View>
        </View>
    );
}

function CommonCorporateFeatures({buttonDisabled, loading, onUpgrade}: {buttonDisabled?: boolean; loading?: boolean; onUpgrade: () => void}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const benefits = [
        translate('workspace.upgrade.commonFeatures.benefits.benefit1'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit2'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit3'),
        translate('workspace.upgrade.commonFeatures.benefits.benefit4'),
    ];

    return (
        <Section
            icon={Illustrations.ShieldYellow}
            cardLayout={CARD_LAYOUT.ICON_ON_LEFT}
        >
            <Text style={[styles.textHeadline, styles.mb4]}>{translate('workspace.upgrade.commonFeatures.title')}</Text>
            <BulletList
                items={benefits}
                header={translate('workspace.upgrade.commonFeatures.note')}
            />
            <View style={[styles.mb5, styles.mt4]}>
                <Text style={[styles.textNormal, styles.textSupporting, styles.mt4]}>
                    {translate('workspace.upgrade.commonFeatures.benefits.note')}{' '}
                    <TextLink
                        style={[styles.link]}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION)}
                    >
                        {translate('workspace.upgrade.commonFeatures.benefits.learnMore')}
                    </TextLink>{' '}
                    {translate('workspace.upgrade.commonFeatures.benefits.pricing')}
                </Text>
            </View>
            <Button
                isLoading={loading}
                text={translate('common.upgrade')}
                success
                onPress={onUpgrade}
                isDisabled={buttonDisabled}
                large
            />
        </Section>
    );
}

export default UpgradeIntro;
