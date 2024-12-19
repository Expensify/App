import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {openLink} from '@libs/actions/Link';
import CONST from '@src/CONST';

type Props = {
    buttonDisabled?: boolean;
    loading?: boolean;
    onDowngrade: () => void;
};

function DowngradeIntro({onDowngrade, buttonDisabled, loading}: Props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const {isExtraSmallScreenWidth} = useResponsiveLayout();

    const benefits = [
        translate('workspace.downgrade.commonFeatures.benefits.benefit1'),
        translate('workspace.downgrade.commonFeatures.benefits.benefit2'),
        translate('workspace.downgrade.commonFeatures.benefits.benefit3'),
        translate('workspace.downgrade.commonFeatures.benefits.benefit4'),
    ];

    return (
        <View style={[styles.m5, styles.workspaceUpgradeIntroBox({isExtraSmallScreenWidth})]}>
            <View style={[styles.mb3]}>
                <Icon
                    src={Illustrations.Mailbox}
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
                        <Text style={[styles.textNormal, styles.textSupporting]}>• </Text>
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
                <Text style={[styles.mv4]}>
                    <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.confirm')}</Text>{' '}
                    <Text style={[styles.textBold, styles.textSupporting]}>{translate('workspace.downgrade.commonFeatures.benefits.warning')}</Text>
                </Text>
            </View>
            <Button
                isLoading={loading}
                text={translate('common.downgradeWorkspace')}
                success
                onPress={onDowngrade}
                isDisabled={buttonDisabled}
                large
            />
        </View>
    );
}

export default DowngradeIntro;
