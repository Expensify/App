import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function SpendRulesSection() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock']);

    const renderTitle = () => (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, {color: theme.text}]}>{translate('workspace.rules.spendRules.title')}</Text>
            <Badge
                text={translate('common.newFeature')}
                isCondensed
                success
            />
        </View>
    );

    return (
        <Section
            isCentralPane
            renderTitle={renderTitle}
            subtitle={translate('workspace.rules.spendRules.subtitle')}
            subtitleMuted
        >
            <MenuItemWithTopDescription
                description={translate('workspace.rules.spendRules.defaultRuleDescription')}
                shouldShowDescriptionOnTop={false}
                title={translate('workspace.rules.spendRules.defaultRuleTitle')}
                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.border, styles.mh0, styles.mt3, styles.ph3]}
                titleStyle={[styles.textSupportingNormal, styles.textStrong, styles.themeTextColor]}
                descriptionTextStyle={[styles.textLabelSupporting, styles.fontSizeLabel]}
                shouldShowRightIcon
                titleIcon={expensifyIcons.Lock}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_ITEM}
            />
        </Section>
    );
}

SpendRulesSection.displayName = 'SpendRulesSection';

export default SpendRulesSection;
