import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function SpendRulesSection() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock']);

    const defaultRuleTitle = translate('workspace.rules.spendRules.defaultRuleTitle');
    const descriptionLabel = translate('workspace.rules.spendRules.defaultRuleDescription');
    const blockLabel = translate('workspace.rules.spendRules.block');

    const renderSectionTitle = () => (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, {color: theme.text}]}>{translate('workspace.rules.spendRules.title')}</Text>
            <Badge
                text={translate('common.newFeature')}
                isCondensed
                success
            />
        </View>
    );

    const menuItemTitle = () => (
        <View style={[styles.flexRow, styles.gap2]}>
            <Badge
                text={blockLabel}
                badgeStyles={[styles.ml0]}
                error
                isCondensed
            />
            <Text
                style={[styles.flex1, styles.textStrong, styles.themeTextColor, styles.preWrap]}
            >
                {defaultRuleTitle}
            </Text>
        </View>
    );

    return (
        <Section
            isCentralPane
            renderTitle={renderSectionTitle}
            subtitle={translate('workspace.rules.spendRules.subtitle')}
            subtitleMuted
        >
            <MenuItem
                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.borderedContentCardLarge, styles.mt3, styles.mh0, styles.ph4, styles.pv3]}
                description={descriptionLabel}
                descriptionTextStyle={[styles.textLabelSupporting, styles.fontSizeLabel, styles.mb2]}
                titleComponent={menuItemTitle()}
                // icon={expensifyIcons.Lock}
                // iconWidth={variables.iconSizeSmall}
                // iconHeight={variables.iconSizeSmall}
                // iconFill={theme.textSupporting}
                shouldShowRightIcon
                accessibilityLabel={`${descriptionLabel}. ${blockLabel} ${defaultRuleTitle}`}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_ITEM}
            />
        </Section>
    );
}

SpendRulesSection.displayName = 'SpendRulesSection';

export default SpendRulesSection;
