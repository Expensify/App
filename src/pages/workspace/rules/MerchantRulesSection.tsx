import React, {useMemo} from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {getCleanedTagName} from '@libs/PolicyUtils';
import type {CodingRule} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type MerchantRulesSectionProps = {
    policyID: string;
};

type FieldLabels = {
    category: string;
    tag: string;
    description: string;
    tax: string;
};

/**
 * Generates a human-readable description of what a coding rule does
 */
function getRuleDescription(rule: CodingRule, translate: ReturnType<typeof useLocalize>['translate'], labels: FieldLabels): string {
    const actions: string[] = [];

    if (rule.merchant) {
        actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleMerchant', rule.merchant));
    }
    if (rule.category) {
        actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', labels.category, getDecodedCategoryName(rule.category)));
    }
    if (rule.tag) {
        actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', labels.tag, getCleanedTagName(rule.tag)));
    }
    if (rule.comment) {
        actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', labels.description, rule.comment));
    }
    if (rule.tax?.field_id_TAX?.value) {
        actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', labels.tax, rule.tax.field_id_TAX.value));
    }
    if (rule.reimbursable !== undefined) {
        actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleReimbursable', rule.reimbursable));
    }
    if (rule.billable !== undefined) {
        actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleBillable', rule.billable));
    }

    // Lowercase any subsequent rule after the first one
    return actions.map((action, index) => (index === 0 ? action : action.charAt(0).toLowerCase() + action.slice(1))).join(', ');
}

function MerchantRulesSection({policyID}: MerchantRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const policy = usePolicy(policyID);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {isDevelopment} = useEnvironment();

    // Hoist iterator-independent translations to avoid redundant calls in the loop
    const fieldLabels: FieldLabels = useMemo(
        () => ({
            category: translate('common.category').toLowerCase(),
            tag: translate('common.tag').toLowerCase(),
            description: translate('common.description').toLowerCase(),
            tax: translate('common.tax').toLowerCase(),
        }),
        [translate],
    );

    const codingRules = policy?.rules?.codingRules;
    const hasRules = !isEmptyObject(codingRules);

    const sortedRules = useMemo(() => {
        if (!codingRules) {
            return [];
        }

        return Object.entries(codingRules)
            .map(([ruleID, rule]) => ({ruleID, ...rule}))
            .sort((a, b) => {
                if (a.created && b.created) {
                    return new Date(b.created).getTime() - new Date(a.created).getTime();
                }
                return 0;
            });
    }, [codingRules]);

    if (!isDevelopment) {
        return null;
    }

    const renderTitle = () => (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, {color: theme.text}]}>{translate('workspace.rules.merchantRules.title')}</Text>
            <Badge
                text={translate('common.newFeature')}
                badgeStyles={styles.badgeNewFeature}
                success
            />
        </View>
    );

    return (
        <Section
            isCentralPane
            renderTitle={renderTitle}
            subtitle={translate('workspace.rules.merchantRules.subtitle')}
            subtitleMuted
        >
            {hasRules && (
                <View style={[styles.mt3]}>
                    {sortedRules.map((rule) => {
                        const merchantName = rule.filters?.right ?? '';
                        const matchDescription = translate('workspace.rules.merchantRules.ruleSummaryTitle', merchantName);
                        const ruleDescription = getRuleDescription(rule, translate, fieldLabels);

                        return (
                            <View key={rule.ruleID}>
                                <MenuItemWithTopDescription
                                    description={matchDescription}
                                    title={ruleDescription}
                                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                                    descriptionTextStyle={[styles.textStrong, styles.themeTextColor]}
                                    titleStyle={[styles.textLabelSupporting]}
                                    shouldShowRightIcon
                                />
                            </View>
                        );
                    })}
                </View>
            )}
            <MenuItem
                title={translate('workspace.rules.merchantRules.addRule')}
                titleStyle={styles.textStrong}
                icon={expensifyIcons.Plus}
                iconHeight={20}
                iconWidth={20}
                style={[styles.sectionMenuItemTopDescription, !hasRules && styles.mt6, styles.mbn3]}
                onPress={() => {}}
            />
        </Section>
    );
}

MerchantRulesSection.displayName = 'MerchantRulesSection';

export default MerchantRulesSection;
