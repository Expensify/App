import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicon from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import type CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type Props = {
    buttonDisabled?: boolean;
    loading?: boolean;
    feature: (typeof CONST.UPGRADE_FEATURE_INTRO_MAPPING)[0];
    onUpgrade: () => void;
};

function UpgradeIntro({feature, onUpgrade, buttonDisabled, loading}: Props) {
    const styles = useThemeStyles();
    const {isExtraSmallScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();

    return (
        <View style={styles.p5}>
            <View style={styles.workspaceUpgradeIntroBox({isExtraSmallScreenWidth, isSmallScreenWidth})}>
                <View style={[styles.mb3, styles.flexRow, styles.justifyContentBetween]}>
                    <Icon
                        src={Illustrations[feature.icon]}
                        width={variables.iconSizeExtraLarge}
                        height={variables.iconSizeExtraLarge}
                    />
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
                        {translate(`workspace.upgrade.${feature.id}.pricing.onlyAvailableOnPlan`)}
                        <Text style={[styles.textWhite, styles.textBold]}>{translate(`workspace.upgrade.${feature.id}.pricing.amount`)}</Text>
                        {translate(`workspace.upgrade.${feature.id}.pricing.perActiveMember`)}
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

export default UpgradeIntro;
