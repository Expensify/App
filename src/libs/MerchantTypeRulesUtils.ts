import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ExpenseDefaultTableItem} from '@components/Tables/WorkspaceExpenseDefaultsTable';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MerchantTypeRuleForm';
import type {MerchantTypeRuleForm} from '@src/types/form/MerchantTypeRuleForm';
import type {Policy, Rule} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {DEFAULT_MCC_GROUP, isDefaultMccGroupID} from './actions/Policy/Category';
import {setWorkspaceDefaultSpendCategory} from './actions/Policy/Policy';
import {clearMerchantRuleErrors} from './actions/Policy/Rules';
import {getDecodedCategoryName} from './CategoryUtils';
import {getExpenseDefaultRuleSummaryFields, getPolicyExpenseDefaultRules, getRuleFilterLeaves, isEditableMerchantRule, isExpenseDefaultTaxValue} from './ExpenseDefaultRuleUtils';
import {getMccGroupDisplayName} from './PolicyRulesUtils';
import {getCommaSeparatedTagNameWithSanitizedColons, getVendorRuleDisplayValue, isXeroActiveMatchingSource} from './PolicyUtils';

const MERCHANT_TYPE_RULE_KEY_PREFIX = 'mcc-group:';

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
            isMerchantType: true,
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
    translate,
    isOffline,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyID: string;
    rules: OnyxCollection<Rule> | undefined;
    translate: LocaleContextProps['translate'];
    isOffline: boolean;
    onNavigate: (route: Route) => void;
}): ExpenseDefaultTableItem[] {
    const policyRules = getPolicyExpenseDefaultRules(rules, policyID);

    if (policyRules.length === 0) {
        return [];
    }

    const isOnXero = isXeroActiveMatchingSource(policy);
    const fieldLabels = {
        category: translate('common.category').toLowerCase(),
        tag: translate('common.tag').toLowerCase(),
        description: translate('common.description').toLowerCase(),
        tax: translate('common.tax').toLowerCase(),
        vendor: translate(isOnXero ? 'common.supplier' : 'common.vendor').toLowerCase(),
    };
    const {FIELD} = CONST.RULES.EXPENSE_DEFAULT;

    return policyRules
        .filter(({rule}) => isOffline || rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        .sort((first, second) => ((second.rule.created ?? '') < (first.rule.created ?? '') ? -1 : 1))
        .map(({ruleID, rule}) => {
            const summaryFields = getExpenseDefaultRuleSummaryFields(rule);
            const merchantName = getRuleFilterLeaves(rule.filters)
                .filter((leaf) => leaf.left === FIELD.MERCHANT)
                .flatMap((leaf) => [leaf.right].flat())
                .join(', ');

            const hasOnlyMerchantRename = summaryFields.length === 1 && summaryFields.at(0)?.field === FIELD.MERCHANT;
            const typeLabel = hasOnlyMerchantRename ? translate('workspace.rules.expenseDefaultsTable.rename') : translate('workspace.rules.expenseDefaultsTable.update');

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
                } else if (field === FIELD.TAX && isExpenseDefaultTaxValue(value) && value.field_id_TAX.value) {
                    actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.tax, `${value.field_id_TAX.name} (${value.field_id_TAX.value})`));
                } else if (field === FIELD.VENDOR_ID && typeof value === 'string') {
                    const unavailableLabel = translate(isOnXero ? 'workspace.rules.merchantRules.supplierUnavailable' : 'workspace.rules.merchantRules.vendorUnavailable');
                    actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.vendor, getVendorRuleDisplayValue(policy, value, unavailableLabel)));
                } else if (field === FIELD.REIMBURSABLE && typeof value === 'boolean') {
                    actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleReimbursable', value));
                } else if (field === FIELD.BILLABLE && typeof value === 'boolean') {
                    actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleBillable', value));
                }
            }
            const ruleDescription = actions.map((action, index) => (index === 0 ? action : action.charAt(0).toLowerCase() + action.slice(1))).join(', ');

            // A rule the editor can't represent would lose whatever the form can't show if it were saved back,
            // so the row summarizes it but doesn't open it. See `getMerchantRuleFormValues`.
            const isEditable = isEditableMerchantRule(rule);

            return {
                keyForList: ruleID,
                ruleID,
                isMerchantType: false,
                isRename: hasOnlyMerchantRename,
                isSelectionDisabled: !isEditable,
                typeLabel,
                conditionText: translate('workspace.rules.expenseDefaultsTable.merchantIs', merchantName),
                ruleDescription,
                searchTokens: [merchantName, ruleDescription],
                pendingAction: rule.pendingAction,
                errors: rule.errors,
                onCloseError: () => clearMerchantRuleErrors(ruleID, rule),
                disabled: !isEditable || rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                action: () => onNavigate(ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID)),
            };
        });
}

function getExpenseDefaultsTableData({
    policy,
    policyID,
    rules,
    translate,
    isOffline,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyID: string;
    rules: OnyxCollection<Rule> | undefined;
    translate: LocaleContextProps['translate'];
    isOffline: boolean;
    onNavigate: (route: Route) => void;
}): ExpenseDefaultTableItem[] {
    const merchantRules = getMerchantRulesTableData({policy, policyID, rules, translate, isOffline, onNavigate});
    const merchantTypeRules = getMerchantTypeRulesTableData({policy, translate, onNavigate});

    return [...merchantRules, ...merchantTypeRules];
}

export {
    getDefaultMccGroupCategory,
    getExpenseDefaultsTableData,
    getMerchantRulesTableData,
    getMerchantTypeRuleFormFromMccGroup,
    isDefaultMccGroupID,
    isMerchantTypeRuleKey,
    saveMerchantTypeRule,
};
