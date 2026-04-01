import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type SpendRulesSectionProps = {
    policyID: string;
};

function SpendRulesSection({policyID}: SpendRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock', 'Plus']);
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardProtectionIllustration']);
    const {isProduction} = useEnvironment();

    const showBuiltInProtectionModal = () => {
        showConfirmModal({
            image: illustrations.ExpensifyCardProtectionIllustration,
            imageStyles: [styles.w100],
            shouldFitImageToContainer: true,
            title: translate('workspace.rules.spendRules.builtInProtectionModal.title'),
            titleStyles: [styles.textHeadlineH1],
            titleContainerStyles: [styles.mb3],
            prompt: translate('workspace.rules.spendRules.builtInProtectionModal.description'),
            promptStyles: [styles.mb1],
            shouldShowCancelButton: false,
            success: false,
            confirmText: translate('common.buttonConfirm'),
            innerContainerStyle: shouldUseNarrowLayout ? undefined : StyleUtils.getWidthStyle(variables.builtInProtectionModalWidth),
        });
    };

    const defaultRuleTitle = translate('workspace.rules.spendRules.defaultRuleTitle');
    const descriptionLabel = translate('workspace.rules.spendRules.defaultRuleDescription');
    const blockLabel = translate('workspace.rules.spendRules.block');

    const renderSectionTitle = () => (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, {color: theme.text}]}>{translate('workspace.rules.spendRules.title')}</Text>
            <Badge
                text={translate('common.newFeature')}
                isCondensed
                success
            />
        </View>
    );

    const menuItemBody = (
        <View>
            <View style={[styles.flexRow, styles.gap2, styles.alignItemsStart]}>
                <Badge
                    text={blockLabel}
                    badgeStyles={[styles.ml0]}
                    error
                    isCondensed
                />
                <Text
                    style={[styles.flex1, styles.flexShrink1, styles.themeTextColor]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {defaultRuleTitle}
                </Text>
            </View>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.mt2]}>
                <Icon
                    src={expensifyIcons.Lock}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                    fill={theme.icon}
                />
                <Text
                    style={[styles.flex1, styles.textLabelSupporting, styles.fontSizeLabel]}
                    numberOfLines={2}
                >
                    {descriptionLabel}
                </Text>
            </View>
        </View>
    );

    return (
        <Section
            renderTitle={renderSectionTitle}
            subtitle={translate('workspace.rules.spendRules.subtitle')}
            isCentralPane
            subtitleMuted
        >
            <MenuItem
                wrapperStyle={[styles.borderedContentCard, styles.mt6, styles.ph4, styles.pv4]}
                titleComponent={menuItemBody}
                accessibilityLabel={`${descriptionLabel}. ${blockLabel} ${defaultRuleTitle}`}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_ITEM}
                onPress={showBuiltInProtectionModal}
                shouldShowRightIcon
            />
            {!isProduction && (
                <MenuItem
                    title={translate('workspace.rules.spendRules.addSpendRule')}
                    titleStyle={styles.textStrong}
                    icon={expensifyIcons.Plus}
                    iconHeight={20}
                    iconWidth={20}
                    style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                    onPress={() => Navigation.navigate(ROUTES.RULES_SPEND_NEW.getRoute(policyID))}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.ADD_SPEND_RULE}
                />
            )}
        </Section>
    );
}

SpendRulesSection.displayName = 'SpendRulesSection';

export default SpendRulesSection;
