import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ExpenseDefaultTableItem} from '@components/Tables/WorkspaceExpenseDefaultsTable';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MerchantTypeRuleForm';
import type {MerchantTypeRuleForm} from '@src/types/form/MerchantTypeRuleForm';
import type {Policy, PolicyTagLists, Rule} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import type {ExpenseDefaultRuleSummaryField} from './ExpenseDefaultRuleUtils';

import {DEFAULT_MCC_GROUP, isDefaultMccGroupID} from './actions/Policy/OptimisticPolicyCategoriesAndMccGroups';
import {setWorkspaceDefaultSpendCategory} from './actions/Policy/Policy';
import {clearMerchantRuleErrors} from './actions/Policy/Rules';
import {getTaxRateDisplayName} from './CategoryTaxRulesUtils';
import {getDecodedCategoryName} from './CategoryUtils';
import {convertAmountToDisplayString} from './CurrencyUtils';
import {
    getExpenseDefaultConditionSummary,
    getExpenseDefaultRuleSummaryFields,
    getPolicyExpenseDefaultRules,
    isEditableExpenseDefaultRule,
    isExpenseDefaultTaxValue,
} from './ExpenseDefaultRuleUtils';
import {getMccGroupDisplayName} from './PolicyRulesUtils';
import {getCommaSeparatedTagNameWithSanitizedColons, getVendorRuleDisplayValue, isTagInPolicy} from './PolicyUtils';

const MERCHANT_TYPE_RULE_KEY_PREFIX = 'mcc-group:';

/**
 * Reads the fields a rule sets into one sentence, such as "Update tax to GST, amount to $10".
 *
 * Shared by the Expense defaults table and the Category rules section of category settings, so a rule reads the
 * same wherever it is listed.
 */
function getExpenseDefaultRuleDescription(summaryFields: ExpenseDefaultRuleSummaryField[], policy: OnyxEntry<Policy>, translate: LocaleContextProps['translate']): string {
    const fieldLabels = {
        category: translate('common.category').toLowerCase(),
        tag: translate('common.tag').toLowerCase(),
        description: translate('common.description').toLowerCase(),
        tax: translate('common.tax').toLowerCase(),
        amount: translate('iou.amount').toLowerCase(),
        vendor: translate('common.vendor').toLowerCase(),
    };
    const {FIELD} = CONST.RULES.EXPENSE_DEFAULT;

    const actions: string[] = [];
    for (const {field, value} of summaryFields) {
        if (field === FIELD.MERCHANT && typeof value === 'string') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleMerchant', value));
        } else if (field === FIELD.CATEGORY && typeof value === 'string') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.category, getDecodedCategoryName(value)));
        } else if (field === FIELD.TAG && typeof value === 'string') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.tag, getCommaSeparatedTagNameWithSanitizedColons(value)));
        } else if (field === FIELD.COMMENT && typeof value === 'string') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.description, value));
        } else if (field === FIELD.TAX && isExpenseDefaultTaxValue(value) && !!value.field_id_TAX.externalID) {
            // The rate saved on the rule is a snapshot, so resolve the live one first and keep the snapshot
            // as a fallback. Without this a renamed rate reads stale, and a rule saved before the rates
            // loaded has no snapshot at all and its tax default disappears from the summary.
            actions.push(
                translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.tax, getTaxRateDisplayName(policy, value.field_id_TAX.externalID, value.field_id_TAX)),
            );
        } else if (field === FIELD.AMOUNT && typeof value === 'number') {
            // The rule stores the amount negated, the way an expense carries it.
            actions.push(
                translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.amount, convertAmountToDisplayString(Math.abs(value), policy?.outputCurrency)),
            );
        } else if (field === FIELD.VENDOR_ID && typeof value === 'string') {
            const unavailableLabel = translate('workspace.rules.merchantRules.vendorUnavailable');
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.vendor, getVendorRuleDisplayValue(policy, value, unavailableLabel)));
        } else if (field === FIELD.REIMBURSABLE && typeof value === 'boolean') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleReimbursable', value));
        } else if (field === FIELD.BILLABLE && typeof value === 'boolean') {
            actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleBillable', value));
        }
    }

    return actions.map((action, index) => (index === 0 ? action : action.charAt(0).toLowerCase() + action.slice(1))).join(', ');
}

function getMerchantTypeRuleKey(groupID: string) {
    return `${MERCHANT_TYPE_RULE_KEY_PREFIX}${groupID}`;
}

function isMerchantTypeRuleKey(key: string) {
    return key.startsWith(MERCHANT_TYPE_RULE_KEY_PREFIX);
}

function getDefaultMccGroupCategory(groupID: string) {
    return DEFAULT_MCC_GROUP[groupID]?.category ?? '';
}

function getMerchantTypeRuleNavigationRoute(policyID: string, groupID: string): Route {
    return ROUTES.RULES_MERCHANT_TYPE_EDIT.getRoute(policyID, groupID);
}

function getMerchantTypeRuleFormFromMccGroup(groupID: string, category: string): MerchantTypeRuleForm {
    return {
        [INPUT_IDS.GROUP_ID]: groupID,
        [INPUT_IDS.CATEGORY]: category,
    };
}

function saveMerchantTypeRule(policyID: string, form: MerchantTypeRuleForm, mccGroup: Policy['mccGroup']) {
    const groupID = form[INPUT_IDS.GROUP_ID];
    const category = form[INPUT_IDS.CATEGORY];

    if (!groupID || !category) {
        return;
    }

    setWorkspaceDefaultSpendCategory(policyID, groupID, category, mccGroup);
}

function getMerchantTypeRulesTableData({
    policy,
    translate,
    onNavigate,
}: {
    policy: Policy | undefined;
    translate: LocaleContextProps['translate'];
    onNavigate: (route: Route) => void;
}): ExpenseDefaultTableItem[] {
    if (!policy?.id) {
        return [];
    }

    const policyID = policy.id;
    const mccGroup = policy.mccGroup ?? DEFAULT_MCC_GROUP;
    const typeLabel = translate('workspace.rules.expenseDefaultsTable.update');
    const fieldLabel = translate('common.category').toLowerCase();

    return Object.keys(mccGroup).map((groupID) => {
        const category = mccGroup[groupID]?.category ?? getDefaultMccGroupCategory(groupID);
        const merchantTypeName = getMccGroupDisplayName(groupID);
        const decodedCategoryName = category ? getDecodedCategoryName(category) : '';
        const ruleDescription = category ? translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabel, decodedCategoryName) : '';
        const conditionText = translate('workspace.rules.expenseDefaultsTable.merchantTypeIs', merchantTypeName);

        return {
            keyForList: getMerchantTypeRuleKey(groupID),
            ruleID: getMerchantTypeRuleKey(groupID),
            groupID,
            section: CONST.POLICY.EXPENSE_DEFAULTS_SECTION.MERCHANT_TYPES,
            isRename: false,
            isSelectionDisabled: true,
            typeLabel,
            conditionText,
            ruleDescription,
            searchTokens: [merchantTypeName, conditionText, ruleDescription, decodedCategoryName],
            pendingAction: mccGroup[groupID]?.pendingAction,
            disabled: mccGroup[groupID]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            action: () => onNavigate(getMerchantTypeRuleNavigationRoute(policyID, groupID)),
        };
    });
}

function getMerchantRulesTableData({
    policy,
    policyID,
    rules,
    policyTags,
    translate,
    isOffline,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyID: string;
    rules: OnyxCollection<Rule> | undefined;
    policyTags?: OnyxEntry<PolicyTagLists>;
    translate: LocaleContextProps['translate'];
    isOffline: boolean;
    onNavigate: (route: Route) => void;
}): ExpenseDefaultTableItem[] {
    const policyRules = getPolicyExpenseDefaultRules(rules, policyID);

    if (policyRules.length === 0) {
        return [];
    }

    const {FIELD} = CONST.RULES.EXPENSE_DEFAULT;

    return (
        policyRules
            .filter(({rule}) => isOffline || rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            // Newest first. Copying a workspace stamps one `created` onto every copy, so ties are normal and have
            // to return 0 rather than a fixed 1, which would order equal rules differently depending on the sort.
            .sort((first, second) => {
                const firstCreated = first.rule.created ?? '';
                const secondCreated = second.rule.created ?? '';
                if (firstCreated === secondCreated) {
                    return 0;
                }
                return secondCreated < firstCreated ? -1 : 1;
            })
            .map(({ruleID, rule}) => {
                // The backend keeps a deleted tag on the rule so it applies again if the tag is recreated, so hide it here.
                // Tags that haven't loaded yet are kept to avoid flicker.
                const summaryFields = getExpenseDefaultRuleSummaryFields(rule).filter(
                    ({field, value}) => field !== FIELD.TAG || !policyTags || typeof value !== 'string' || isTagInPolicy(value, policyTags),
                );
                const {merchants, categories, tags} = getExpenseDefaultConditionSummary(rule.filters);
                const merchantNames = merchants.map(({value}) => value).join(', ');
                const categoryNames = categories.map(getDecodedCategoryName).join(', ');
                const tagNames = tags.map(getCommaSeparatedTagNameWithSanitizedColons).join(', ');

                // Each section lists the rules that one field alone decides. A rule matching on more than one of
                // them reads as a merchant rule, so it stays with the merchants rather than being listed twice.
                const isCategoryOnlyRule = categories.length > 0 && merchants.length === 0 && tags.length === 0;
                const isTagOnlyRule = tags.length > 0 && merchants.length === 0 && categories.length === 0;
                const hasOnlyMerchantRename = summaryFields.length === 1 && summaryFields.at(0)?.field === FIELD.MERCHANT;
                const typeLabel = hasOnlyMerchantRename ? translate('workspace.rules.expenseDefaultsTable.rename') : translate('workspace.rules.expenseDefaultsTable.update');

                const ruleDescription = getExpenseDefaultRuleDescription(summaryFields, policy, translate);
                const pendingAction = rule.pendingAction;

                // A rule the editor can't represent would lose whatever the form can't show if it were saved back,
                // so the row summarizes it but doesn't open it. See `getExpenseDefaultFormValues`. It stays selectable
                // either way, because deleting it is the only thing an admin can still do with it.
                const isEditable = isEditableExpenseDefaultRule(rule);
                const openEditor = () => {
                    if (!isEditable) {
                        return;
                    }
                    onNavigate(ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID));
                };

                return {
                    keyForList: ruleID,
                    ruleID,
                    section: getExpenseDefaultSection(isCategoryOnlyRule, isTagOnlyRule),
                    isRename: hasOnlyMerchantRename,
                    typeLabel,
                    conditionText: getExpenseDefaultConditionText(rule.filters, translate),
                    ruleDescription,
                    searchTokens: [merchantNames, categoryNames, tagNames, ruleDescription].filter(Boolean),
                    pendingAction,
                    errors: rule.errors,
                    onCloseError: () => clearMerchantRuleErrors(ruleID, rule),
                    disabled: rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    action: openEditor,
                };
            })
    );
}

/**
 * Reads a rule's conditions as one sentence, which is what both the Expense defaults table and the category
 * settings rows show so a rule is worded the same in both places.
 *
 * `shouldOmitCategories` drops the category clause for the category's own settings page, where naming the
 * category the admin is already looking at reads as noise.
 */
function getExpenseDefaultConditionText(filters: Rule['filters'], translate: LocaleContextProps['translate'], shouldOmitCategories = false): string {
    const {merchants, categories, tags} = getExpenseDefaultConditionSummary(filters);

    const contained: string[] = [];
    const exact: string[] = [];
    for (const {value, isExactMatch} of merchants) {
        (isExactMatch ? exact : contained).push(value);
    }

    const conditions: string[] = [];
    // Spelled out rather than a single "Merchant is", so a contains rule and an exact match rule on the
    // same merchant don't read as duplicates.
    if (contained.length > 0) {
        conditions.push(translate('workspace.rules.expenseDefaultsTable.merchantContains', contained.join(', ')));
    }
    if (exact.length > 0) {
        conditions.push(translate('workspace.rules.expenseDefaultsTable.merchantExactlyMatches', exact.join(', ')));
    }
    if (!shouldOmitCategories && categories.length > 0) {
        conditions.push(translate('workspace.rules.expenseDefaultsTable.categoryIs', categories.map(getDecodedCategoryName).join(', ')));
    }
    if (tags.length > 0) {
        conditions.push(translate('workspace.rules.expenseDefaultsTable.tagIs', tags.map(getCommaSeparatedTagNameWithSanitizedColons).join(', ')));
    }

    // A rule matches on every condition it carries, so the row reads them as one sentence.
    return conditions.join(` ${translate('common.and')} `);
}

function getExpenseDefaultSection(isCategoryOnlyRule: boolean, isTagOnlyRule: boolean): ValueOf<typeof CONST.POLICY.EXPENSE_DEFAULTS_SECTION> {
    if (isCategoryOnlyRule) {
        return CONST.POLICY.EXPENSE_DEFAULTS_SECTION.CATEGORIES;
    }
    if (isTagOnlyRule) {
        return CONST.POLICY.EXPENSE_DEFAULTS_SECTION.TAGS;
    }
    return CONST.POLICY.EXPENSE_DEFAULTS_SECTION.MERCHANTS;
}

function getExpenseDefaultsTableData({
    policy,
    policyID,
    rules,
    policyTags,
    translate,
    isOffline,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyID: string;
    rules: OnyxCollection<Rule> | undefined;
    /** Read to hide a deleted tag from a merchant rule's summary. */
    policyTags: OnyxEntry<PolicyTagLists>;
    translate: LocaleContextProps['translate'];
    isOffline: boolean;
    onNavigate: (route: Route) => void;
}): ExpenseDefaultTableItem[] {
    const merchantRules = getMerchantRulesTableData({policy, policyID, rules, policyTags, translate, isOffline, onNavigate});
    const merchantTypeRules = getMerchantTypeRulesTableData({policy, translate, onNavigate});

    return [...merchantRules, ...merchantTypeRules];
}

export {
    getDefaultMccGroupCategory,
    getExpenseDefaultConditionText,
    getExpenseDefaultRuleDescription,
    getExpenseDefaultsTableData,
    getMerchantRulesTableData,
    getMerchantTypeRuleFormFromMccGroup,
    isDefaultMccGroupID,
    isMerchantTypeRuleKey,
    saveMerchantTypeRule,
};
