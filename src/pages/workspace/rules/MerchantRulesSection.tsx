import Badge from '@components/Badge';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SearchBar from '@components/SearchBar';
import Section from '@components/Section';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {getExpenseDefaultRuleSummaryFields, getMerchantRuleFormValues, getPolicyExpenseDefaultRules, isExpenseDefaultTaxValue} from '@libs/ExpenseDefaultRuleUtils';
import type {RuleWithID} from '@libs/ExpenseDefaultRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCommaSeparatedTagNameWithSanitizedColons, getVendorRuleDisplayValue, isXeroActiveMatchingSource} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import {clearMerchantRuleErrors} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Rule} from '@src/types/onyx';

import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';

type MerchantRulesSectionProps = {
    policyID: string;
    canWriteRules: boolean;
    showReadOnlyModal: () => void;
};

type FieldLabels = {
    category: string;
    tag: string;
    description: string;
    tax: string;
    vendor: string;
};

/**
 * Generates a human-readable description of what a merchant rule does
 */
function getRuleDescription(rule: Rule, translate: ReturnType<typeof useLocalize>['translate'], labels: FieldLabels, policy: Policy | undefined): string {
    const {FIELD} = CONST.RULES.EXPENSE_DEFAULT;
    const actions: string[] = [];

    for (const {field, value} of getExpenseDefaultRuleSummaryFields(rule)) {
        if (field === FIELD.MERCHANT && typeof value === 'string') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleMerchant', value));
        } else if (field === FIELD.CATEGORY && typeof value === 'string') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', labels.category, getDecodedCategoryName(value)));
        } else if (field === FIELD.TAG && typeof value === 'string') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', labels.tag, getCommaSeparatedTagNameWithSanitizedColons(value)));
        } else if (field === FIELD.COMMENT && typeof value === 'string') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', labels.description, value));
        } else if (field === FIELD.TAX && isExpenseDefaultTaxValue(value) && value.field_id_TAX.value) {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', labels.tax, `${value.field_id_TAX.name} (${value.field_id_TAX.value})`));
        } else if (field === FIELD.VENDOR_ID && typeof value === 'string') {
            const unavailableLabel = translate(isXeroActiveMatchingSource(policy) ? 'workspace.rules.merchantRules.supplierUnavailable' : 'workspace.rules.merchantRules.vendorUnavailable');
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', labels.vendor, getVendorRuleDisplayValue(policy, value, unavailableLabel)));
        } else if (field === FIELD.REIMBURSABLE && typeof value === 'boolean') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleReimbursable', value));
        } else if (field === FIELD.BILLABLE && typeof value === 'boolean') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleBillable', value));
        }
    }

    // Lowercase any subsequent rule after the first one
    return actions.map((action, index) => (index === 0 ? action : action.charAt(0).toLowerCase() + action.slice(1))).join(', ');
}

function MerchantRulesSection({policyID, canWriteRules, showReadOnlyModal}: MerchantRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);

    // Hoist iterator-independent translations to avoid redundant calls in the loop
    const fieldLabels: FieldLabels = useMemo(
        () => ({
            category: translate('common.category').toLowerCase(),
            tag: translate('common.tag').toLowerCase(),
            description: translate('common.description').toLowerCase(),
            tax: translate('common.tax').toLowerCase(),
            vendor: translate(isXeroActiveMatchingSource(policy) ? 'common.supplier' : 'common.vendor').toLowerCase(),
        }),
        [translate, policy],
    );

    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const sortedRules = useMemo(
        () => getPolicyExpenseDefaultRules(rules, policyID).sort((first, second) => ((second.rule.created ?? '') < (first.rule.created ?? '') ? -1 : 1)),
        [rules, policyID],
    );
    const hasRules = sortedRules.length > 0;

    // Exclude pending-delete rules when online because OfflineWithFeedback hides them visually.
    // When offline, keep them so OfflineWithFeedback can show strikethrough styling.
    const visibleRules = useMemo(() => sortedRules.filter(({rule}) => isOffline || rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE), [sortedRules, isOffline]);

    const filterRule = (ruleWithID: RuleWithID, searchInput: string) =>
        tokenizedSearch([ruleWithID], searchInput, () => [getMerchantRuleFormValues(ruleWithID.rule)?.merchantToMatch ?? '']).length > 0;

    const [ruleSearchInput, setRuleSearchInput, filteredRules] = useSearchResults(visibleRules, filterRule);

    useEffect(() => {
        if (visibleRules.length > CONST.SEARCH_BAR_THRESHOLD) {
            return;
        }
        setRuleSearchInput('');
    }, [visibleRules.length, setRuleSearchInput]);

    const renderTitle = () => (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, {color: theme.text}]}>{translate('workspace.rules.merchantRules.title')}</Text>
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
            subtitle={translate('workspace.rules.merchantRules.subtitle')}
            subtitleMuted
            childrenStyles={[styles.gap3]}
        >
            {hasRules && (
                <View style={[styles.mt3, styles.gap2]}>
                    {visibleRules.length > CONST.SEARCH_BAR_THRESHOLD && (
                        <SearchBar
                            label={translate('workspace.rules.merchantRules.findRule')}
                            inputValue={ruleSearchInput}
                            onChangeText={setRuleSearchInput}
                            style={[styles.mt3, styles.mh0]}
                            shouldShowEmptyState={filteredRules.length === 0}
                            emptyStateContainerStyle={styles.ph0}
                        />
                    )}
                    {filteredRules.map(({ruleID, rule}) => {
                        // A rule the editor can't represent is listed but not opened - saving it back would drop
                        // whatever the form couldn't show. See `getMerchantRuleFormValues`.
                        const formValues = getMerchantRuleFormValues(rule);
                        const merchantName = formValues?.merchantToMatch ?? '';
                        const isExactMatch = formValues?.matchType === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO;
                        const matchDescription = translate('workspace.rules.merchantRules.ruleSummaryTitle', merchantName, isExactMatch);
                        const ruleDescription = getRuleDescription(rule, translate, fieldLabels, policy);

                        return (
                            <View key={ruleID}>
                                <OfflineWithFeedback
                                    pendingAction={rule.pendingAction}
                                    errors={rule.errors}
                                    onClose={() => clearMerchantRuleErrors(ruleID, rule)}
                                >
                                    <MenuItemWithTopDescription
                                        description={matchDescription}
                                        title={ruleDescription}
                                        wrapperStyle={[styles.borderedContentCard, styles.ph4, styles.pv4]}
                                        descriptionTextStyle={[styles.textNormalThemeText, {lineHeight: variables.fontSizeNormalHeight}]}
                                        titleStyle={[styles.textLabelSupporting, styles.fontSizeLabel]}
                                        shouldShowRightIcon
                                        onPress={() => Navigation.navigate(ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID))}
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_ITEM}
                                        disabled={!formValues || rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                                    />
                                </OfflineWithFeedback>
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
                style={[styles.sectionMenuItemTopDescription, !hasRules && styles.mt6, styles.mbn3, !canWriteRules && styles.buttonOpacityDisabled]}
                onPress={() => {
                    if (!canWriteRules) {
                        showReadOnlyModal();
                        return;
                    }
                    Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
                }}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.ADD_MERCHANT_RULE}
            />
        </Section>
    );
}

MerchantRulesSection.displayName = 'MerchantRulesSection';

export default MerchantRulesSection;
export {getRuleDescription};
