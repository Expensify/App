import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicon from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';

type Props = {
    buttonDisabled?: boolean;
    loading?: boolean;
    title: string;
    description: string;
    icon: IconAsset;
    onUpgrade: () => void;
};

function UpgradeIntro({title, description, icon, onUpgrade, buttonDisabled, loading}: Props) {
    const styles = useThemeStyles();
    const {isExtraSmallScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();

    return (
        <View style={styles.p5}>
            <View style={styles.workspaceUpgradeIntroBox({isExtraSmallScreenWidth, isSmallScreenWidth})}>
                <View style={[styles.mb3, styles.flexRow, styles.justifyContentBetween]}>
                    <Icon
                        src={icon}
                        width={variables.iconSizeExtraLarge}
                        height={variables.iconSizeExtraLarge}
                    />
                    <Badge
                        icon={Expensicon.Unlock}
                        text={translate('workspace.upgrade.upgradeToUnlock')}
                        success
                    />
                </View>
                <View style={styles.mb4}>
                    <Text style={styles.textHeadlineH1}>{title}</Text>
                </View>
                <View style={styles.mb5}>
                    <Text style={[styles.textNormal, styles.textSupporting]}>{description}</Text>
                </View>
                <Button
                    isLoading={loading}
                    text={translate('common.upgrade')}
                    success
                    onPress={onUpgrade}
                    isDisabled={buttonDisabled}
                />
            </View>
            <View style={styles.mt6}>
                <Text style={[styles.textNormal, styles.textSupporting]}>
                    {translate('workspace.upgrade.note.upgradeWorkspace')}{' '}
                    <TextLink
                        style={[styles.link]}
                        href=""
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
