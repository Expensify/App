import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ExpenseDefaultTableItem} from '@components/Tables/WorkspaceExpenseDefaultsTable';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {MerchantTypeRuleForm} from '@src/types/form/MerchantTypeRuleForm';
import INPUT_IDS from '@src/types/form/MerchantTypeRuleForm';
import type {Policy} from '@src/types/onyx';
import type {CodingRule} from '@src/types/onyx/Policy';
import {DEFAULT_MCC_GROUP, isDefaultMccGroupID} from './actions/Policy/Category';
import {setWorkspaceDefaultSpendCategory} from './actions/Policy/Policy';
import {clearPolicyCodingRuleErrors} from './actions/Policy/Rules';
import {getDecodedCategoryName} from './CategoryUtils';
import Parser from './Parser';
import {getMccGroupDisplayName} from './PolicyRulesUtils';
import {getCommaSeparatedTagNameWithSanitizedColons} from './PolicyUtils';

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

function getMerchantCodingRulesTableData({
    policy,
    policyID,
    translate,
    isOffline,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyID: string;
    translate: LocaleContextProps['translate'];
    isOffline: boolean;
    onNavigate: (route: Route) => void;
}): ExpenseDefaultTableItem[] {
    const codingRules = policy?.rules?.codingRules;

    if (!codingRules) {
        return [];
    }

    const fieldLabels = {
        category: translate('common.category').toLowerCase(),
        tag: translate('common.tag').toLowerCase(),
        description: translate('common.description').toLowerCase(),
        tax: translate('common.tax').toLowerCase(),
    };

    return Object.entries(codingRules)
        .filter(([, rule]) => !!rule && (isOffline || rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE))
        .map(([ruleID, rule]: [string, CodingRule]) => {
            const merchantName = rule.filters?.right ?? '';
            const hasOnlyMerchantRename =
                !!rule.merchant && !rule.category && !rule.tag && !rule.comment && !rule.tax?.field_id_TAX?.value && rule.reimbursable === undefined && rule.billable === undefined;
            const typeLabel = hasOnlyMerchantRename ? translate('workspace.rules.expenseDefaultsTable.rename') : translate('workspace.rules.expenseDefaultsTable.update');

            const actions: string[] = [];
            if (rule.merchant) {
                actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleMerchant', rule.merchant));
            }
            if (rule.category) {
                actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.category, getDecodedCategoryName(rule.category)));
            }
            if (rule.tag) {
                actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.tag, getCommaSeparatedTagNameWithSanitizedColons(rule.tag)));
            }
            if (rule.comment) {
                const commentMarkdown = Parser.htmlToMarkdown(rule.comment);
                actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.description, commentMarkdown));
            }
            if (rule.tax?.field_id_TAX?.value) {
                actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabels.tax, `${rule.tax.field_id_TAX.name} (${rule.tax.field_id_TAX.value})`));
            }
            if (rule.reimbursable !== undefined) {
                actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleReimbursable', rule.reimbursable));
            }
            if (rule.billable !== undefined) {
                actions.push(translate('workspace.rules.merchantRules.ruleSummarySubtitleBillable', rule.billable));
            }
            const ruleDescription = actions.map((action, index) => (index === 0 ? action : action.charAt(0).toLowerCase() + action.slice(1))).join(', ');

            return {
                keyForList: ruleID,
                ruleID,
                isMerchantType: false,
                isRename: hasOnlyMerchantRename,
                typeLabel,
                conditionText: translate('workspace.rules.expenseDefaultsTable.merchantIs', merchantName),
                ruleDescription,
                searchTokens: [merchantName, ruleDescription],
                pendingAction: rule.pendingAction,
                errors: rule.errors,
                onCloseError: () => clearPolicyCodingRuleErrors(policyID, ruleID, rule),
                disabled: rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                action: () => onNavigate(ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID)),
            };
        });
}

function getExpenseDefaultsTableData({
    policy,
    policyID,
    translate,
    isOffline,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyID: string;
    translate: LocaleContextProps['translate'];
    isOffline: boolean;
    onNavigate: (route: Route) => void;
}): ExpenseDefaultTableItem[] {
    const merchantRules = getMerchantCodingRulesTableData({policy, policyID, translate, isOffline, onNavigate});
    const merchantTypeRules = getMerchantTypeRulesTableData({policy, translate, onNavigate});

    return [...merchantRules, ...merchantTypeRules];
}

export {getDefaultMccGroupCategory, getExpenseDefaultsTableData, getMerchantTypeRuleFormFromMccGroup, isDefaultMccGroupID, isMerchantTypeRuleKey, saveMerchantTypeRule};
