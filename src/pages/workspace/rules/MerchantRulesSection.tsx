import React, {useMemo} from 'react';
import {View} from 'react-native';
import EmptyStateComponent from '@components/EmptyStateComponent';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {CodingRule} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type MerchantRulesSectionProps = {
    policyID: string;
};

/**
 * Generates a human-readable description of what a coding rule does
 */
function getRuleDescription(rule: CodingRule, translate: ReturnType<typeof useLocalize>['translate']): string {
    const actions: string[] = [];

    if (rule.category) {
        actions.push(`${translate('workspace.rules.merchantRules.setCategory')}: ${rule.category}`);
    }
    if (rule.tag) {
        actions.push(`${translate('workspace.rules.merchantRules.setTag')}: ${rule.tag}`);
    }
    if (rule.merchant) {
        actions.push(`${translate('workspace.rules.merchantRules.renameMerchant')}: ${rule.merchant}`);
    }
    if (rule.comment) {
        actions.push(`${translate('workspace.rules.merchantRules.setDescription')}: ${rule.comment}`);
    }
    if (rule.reimbursable !== undefined) {
        actions.push(`${translate('workspace.rules.merchantRules.setReimbursable')}: ${rule.reimbursable ? translate('common.yes') : translate('common.no')}`);
    }
    if (rule.billable !== undefined) {
        actions.push(`${translate('workspace.rules.merchantRules.setBillable')}: ${rule.billable ? translate('common.yes') : translate('common.no')}`);
    }
    if (rule.tax?.field_id_TAX?.value) {
        actions.push(`${translate('workspace.rules.merchantRules.setTax')}: ${rule.tax.field_id_TAX.value}`);
    }

    return actions.join(', ') || '';
}

function MerchantRulesSection({policyID}: MerchantRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    const codingRules = policy?.rules?.codingRules;
    const hasRules = !isEmptyObject(codingRules);

    // Sort rules by creation date (newest first) and convert to array for rendering
    const sortedRules = useMemo(() => {
        if (!codingRules) {
            return [];
        }

        return Object.entries(codingRules)
            .map(([ruleID, rule]) => ({ruleID, ...rule}))
            .sort((a, b) => {
                // Sort by created date, newest first
                if (a.created && b.created) {
                    return new Date(b.created).getTime() - new Date(a.created).getTime();
                }
                return 0;
            });
    }, [codingRules]);

    return (
        <Section
            isCentralPane
            title={translate('workspace.rules.merchantRules.title')}
            subtitle={translate('workspace.rules.merchantRules.subtitle')}
            titleStyles={styles.accountSettingsSectionTitle}
            subtitleMuted
        >
            <View style={[styles.mt3]}>
                {!hasRules ? (
                    <EmptyStateComponent
                        headerMediaType={CONST.EMPTY_STATE_MEDIA.ICON}
                        title={translate('workspace.rules.merchantRules.emptyTitle')}
                        subtitle={translate('workspace.rules.merchantRules.emptySubtitle')}
                        containerStyles={styles.mt0}
                    />
                ) : (
                    sortedRules.map((rule) => {
                        const merchantName = rule.filters?.right ?? '';
                        const isExactMatch = rule.filters?.operator === 'eq';
                        const matchDescription = isExactMatch
                            ? translate('workspace.rules.merchantRules.ruleAppliesWhenExact', {merchantName})
                            : translate('workspace.rules.merchantRules.ruleAppliesWhen', {merchantName});
                        const ruleDescription = getRuleDescription(rule, translate);

                        return (
                            <View key={rule.ruleID}>
                                <MenuItemWithTopDescription
                                    description={matchDescription}
                                    title={ruleDescription}
                                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                                    numberOfLinesTitle={2}
                                    interactive={false}
                                />
                            </View>
                        );
                    })
                )}
                {hasRules && (
                    <Text style={[styles.mutedNormalTextLabel, styles.mt3]}>
                        {translate('workspace.rules.merchantRules.subtitle')}
                    </Text>
                )}
            </View>
        </Section>
    );
}

MerchantRulesSection.displayName = 'MerchantRulesSection';

export default MerchantRulesSection;
