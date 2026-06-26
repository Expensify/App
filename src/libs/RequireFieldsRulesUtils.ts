import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TableData} from '@components/Table';
import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';
import type PolicyData from '@hooks/usePolicyData/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {RequireFieldsRuleForm} from '@src/types/form/RequireFieldsRuleForm';
import type {Policy, PolicyCategories, PolicyCategory} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {
    removePolicyCategoryItemizedReceiptsRequired,
    removePolicyCategoryReceiptsRequired,
    setPolicyCategoryAttendeesRequired,
    setPolicyCategoryDescriptionRequired,
    setPolicyCategoryItemizedReceiptsRequired,
    setPolicyCategoryReceiptsAndItemizedReceiptRequired,
    setPolicyCategoryReceiptsRequired,
} from './actions/Policy/Category';
import {getDecodedCategoryName} from './CategoryUtils';

type RequireFieldsRuleType = DeepValueOf<typeof CONST.REQUIRE_FIELDS_RULE_TYPES>;

type RequireFieldsTableItem = TableData & {
    ruleID: string;
    ruleType: RequireFieldsRuleType;
    categoryName: string;
    typeLabel: string;
    conditionText: string;
    ruleDescription: string;
    searchTokens: string[];
    pendingAction?: PendingAction;
    action: () => void;
};

const RULE_KEY_SEPARATOR = '::';

function getRequireFieldsRuleKey(categoryName: string, ruleType: RequireFieldsRuleType): string {
    return `${categoryName}${RULE_KEY_SEPARATOR}${ruleType}`;
}

function parseRequireFieldsRuleKey(ruleKey: string): {categoryName: string; ruleType: RequireFieldsRuleType} | undefined {
    const separatorIndex = ruleKey.indexOf(RULE_KEY_SEPARATOR);
    if (separatorIndex === -1) {
        return undefined;
    }

    const categoryName = ruleKey.slice(0, separatorIndex);
    const ruleType = ruleKey.slice(separatorIndex + RULE_KEY_SEPARATOR.length) as RequireFieldsRuleType;

    if (!Object.values(CONST.REQUIRE_FIELDS_RULE_TYPES).includes(ruleType)) {
        return undefined;
    }

    return {categoryName, ruleType};
}

function getRequireFieldsRuleNavigationRoute(policyID: string, categoryName: string): Route {
    return ROUTES.RULES_REQUIRE_FIELDS_RULE_EDIT.getRoute(policyID, categoryName);
}

function isRequireFieldEnabled(category: PolicyCategory | undefined, field: keyof RequireFieldsRuleForm): boolean {
    if (!category) {
        return false;
    }

    switch (field) {
        case 'requireDescription':
            return !!category.areCommentsRequired;
        case 'requireAttendees':
            return !!category.areAttendeesRequired;
        case 'requireReceipt':
            return hasExplicitReceiptThreshold(category.maxAmountNoReceipt);
        case 'requireItemizedReceipt':
            return hasExplicitReceiptThreshold(category.maxAmountNoItemizedReceipt);
        default:
            return false;
    }
}

function getRequireFieldsFormFromCategory(category: PolicyCategory | undefined): RequireFieldsRuleForm {
    return {
        requireDescription: isRequireFieldEnabled(category, 'requireDescription'),
        requireAttendees: isRequireFieldEnabled(category, 'requireAttendees'),
        requireReceipt: isRequireFieldEnabled(category, 'requireReceipt'),
        requireItemizedReceipt: isRequireFieldEnabled(category, 'requireItemizedReceipt'),
    };
}

function saveRequireFieldsRule(policyData: PolicyData, form: RequireFieldsRuleForm) {
    const categoryName = form.category;
    if (!categoryName || !policyData.policy?.id) {
        return;
    }

    const policyCategories = policyData.categories;
    const category = policyCategories?.[categoryName];
    const initialForm = getRequireFieldsFormFromCategory(category);

    if (form.requireDescription !== initialForm.requireDescription) {
        setPolicyCategoryDescriptionRequired(policyData.policy.id, categoryName, !!form.requireDescription, policyCategories);
    }

    if (form.requireAttendees !== initialForm.requireAttendees) {
        setPolicyCategoryAttendeesRequired(policyData.policy.id, categoryName, !!form.requireAttendees, policyCategories);
    }

    const shouldRequireReceipt = !!form.requireReceipt;
    const shouldRequireItemizedReceipt = !!form.requireItemizedReceipt;
    const hadReceipt = isRequireFieldEnabled(category, 'requireReceipt');
    const hadItemizedReceipt = isRequireFieldEnabled(category, 'requireItemizedReceipt');

    if (shouldRequireItemizedReceipt && !shouldRequireReceipt && !hadReceipt) {
        setPolicyCategoryReceiptsAndItemizedReceiptRequired(policyData, categoryName, 0, 0);
    } else {
        if (shouldRequireReceipt !== hadReceipt) {
            if (shouldRequireReceipt) {
                setPolicyCategoryReceiptsRequired(policyData, categoryName, 0);
            } else {
                removePolicyCategoryReceiptsRequired(policyData, categoryName);
            }
        }

        if (shouldRequireItemizedReceipt !== hadItemizedReceipt) {
            if (shouldRequireItemizedReceipt) {
                if (shouldRequireReceipt || hadReceipt || category?.maxAmountNoReceipt === 0) {
                    setPolicyCategoryItemizedReceiptsRequired(policyData, categoryName, 0);
                } else {
                    setPolicyCategoryReceiptsAndItemizedReceiptRequired(policyData, categoryName, 0, 0);
                }
            } else {
                removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
            }
        }
    }
}

function hasExplicitReceiptThreshold(value: number | null | undefined): value is number {
    return value !== null && value !== undefined && value !== CONST.DISABLED_MAX_EXPENSE_VALUE;
}

function isCategoryFieldPending(pendingAction: PendingAction | undefined): boolean {
    return pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
}

function deleteRequireFieldsRule(policyData: PolicyData, ruleKey: string) {
    const parsedRule = parseRequireFieldsRuleKey(ruleKey);
    if (!parsedRule || !policyData.policy?.id) {
        return;
    }

    const {categoryName, ruleType} = parsedRule;
    const policyID = policyData.policy.id;
    const policyCategories = policyData.categories;

    switch (ruleType) {
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION:
            setPolicyCategoryDescriptionRequired(policyID, categoryName, false, policyCategories);
            break;
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ATTENDEES:
            setPolicyCategoryAttendeesRequired(policyID, categoryName, false, policyCategories);
            break;
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER:
            removePolicyCategoryReceiptsRequired(policyData, categoryName);
            break;
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER:
            removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
            break;
        default:
            break;
    }
}

function getRequireFieldsRuleDescription(
    translate: LocaleContextProps['translate'],
    ruleType: RequireFieldsRuleType,
    amount: number | undefined,
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
    policyCurrency: string,
): string {
    switch (ruleType) {
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION:
            return translate('workspace.rules.requireFieldsTable.requireDescription');
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ATTENDEES:
            return translate('workspace.rules.requireFieldsTable.requireAttendees');
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER:
            if (amount === 0) {
                return translate('workspace.rules.requireFieldsTable.alwaysRequireReceipt');
            }
            return translate('workspace.rules.requireFieldsTable.requireReceiptOver', convertToDisplayString(amount ?? 0, policyCurrency));
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER:
            if (amount === 0) {
                return translate('workspace.rules.requireFieldsTable.requireItemizedReceipt');
            }
            return translate('workspace.rules.requireFieldsTable.requireItemizedReceiptOver', convertToDisplayString(amount ?? 0, policyCurrency));
        default:
            return '';
    }
}

function getRequireFieldsPendingAction(ruleType: RequireFieldsRuleType, pendingFields: PolicyCategories[string]['pendingFields']): PendingAction | undefined {
    switch (ruleType) {
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION:
            return pendingFields?.areCommentsRequired;
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ATTENDEES:
            return pendingFields?.areAttendeesRequired;
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER:
            return pendingFields?.maxAmountNoReceipt;
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER:
            return pendingFields?.maxAmountNoItemizedReceipt;
        default:
            return undefined;
    }
}

function getRequireFieldsTableData({
    policy,
    policyCategories,
    translate,
    convertToDisplayString,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyCategories: PolicyCategories | undefined;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    onNavigate: (route: Route) => void;
}): RequireFieldsTableItem[] {
    if (!policy?.id || !policyCategories) {
        return [];
    }

    const policyID = policy.id;
    const policyCurrency = policy.outputCurrency ?? CONST.CURRENCY.USD;
    const typeLabel = translate('workspace.rules.requireFieldsTable.typeLabel');
    const rules: RequireFieldsTableItem[] = [];

    for (const [categoryName, category] of Object.entries(policyCategories)) {
        if (!category?.enabled) {
            continue;
        }

        const decodedCategoryName = getDecodedCategoryName(categoryName);
        const conditionText = translate('workspace.rules.requireFieldsTable.conditionCategoryIs', decodedCategoryName);
        const pendingFields = category.pendingFields;

        if (category.areCommentsRequired) {
            const ruleType = CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION;
            const ruleDescription = getRequireFieldsRuleDescription(translate, ruleType, undefined, convertToDisplayString, policyCurrency);
            rules.push({
                keyForList: getRequireFieldsRuleKey(categoryName, ruleType),
                ruleID: getRequireFieldsRuleKey(categoryName, ruleType),
                ruleType,
                categoryName,
                typeLabel,
                conditionText,
                ruleDescription,
                searchTokens: [decodedCategoryName, ruleDescription, typeLabel],
                pendingAction: getRequireFieldsPendingAction(ruleType, pendingFields),
                disabled: isCategoryFieldPending(pendingFields?.areCommentsRequired),
                action: () => onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName)),
            });
        }

        if (category.areAttendeesRequired) {
            const ruleType = CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ATTENDEES;
            const ruleDescription = getRequireFieldsRuleDescription(translate, ruleType, undefined, convertToDisplayString, policyCurrency);
            rules.push({
                keyForList: getRequireFieldsRuleKey(categoryName, ruleType),
                ruleID: getRequireFieldsRuleKey(categoryName, ruleType),
                ruleType,
                categoryName,
                typeLabel,
                conditionText,
                ruleDescription,
                searchTokens: [decodedCategoryName, ruleDescription, typeLabel],
                pendingAction: getRequireFieldsPendingAction(ruleType, pendingFields),
                disabled: isCategoryFieldPending(pendingFields?.areAttendeesRequired),
                action: () => onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName)),
            });
        }

        if (hasExplicitReceiptThreshold(category.maxAmountNoReceipt)) {
            const ruleType = CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER;
            const ruleDescription = getRequireFieldsRuleDescription(translate, ruleType, category.maxAmountNoReceipt, convertToDisplayString, policyCurrency);
            rules.push({
                keyForList: getRequireFieldsRuleKey(categoryName, ruleType),
                ruleID: getRequireFieldsRuleKey(categoryName, ruleType),
                ruleType,
                categoryName,
                typeLabel,
                conditionText,
                ruleDescription,
                searchTokens: [decodedCategoryName, ruleDescription, typeLabel],
                pendingAction: getRequireFieldsPendingAction(ruleType, pendingFields),
                disabled: isCategoryFieldPending(pendingFields?.maxAmountNoReceipt),
                action: () => onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName)),
            });
        }

        if (hasExplicitReceiptThreshold(category.maxAmountNoItemizedReceipt)) {
            const ruleType = CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER;
            const ruleDescription = getRequireFieldsRuleDescription(translate, ruleType, category.maxAmountNoItemizedReceipt ?? undefined, convertToDisplayString, policyCurrency);
            rules.push({
                keyForList: getRequireFieldsRuleKey(categoryName, ruleType),
                ruleID: getRequireFieldsRuleKey(categoryName, ruleType),
                ruleType,
                categoryName,
                typeLabel,
                conditionText,
                ruleDescription,
                searchTokens: [decodedCategoryName, ruleDescription, typeLabel],
                pendingAction: getRequireFieldsPendingAction(ruleType, pendingFields),
                disabled: isCategoryFieldPending(pendingFields?.maxAmountNoItemizedReceipt),
                action: () => onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName)),
            });
        }
    }

    return rules.sort((a, b) => a.conditionText.localeCompare(b.conditionText));
}

export {deleteRequireFieldsRule, getRequireFieldsFormFromCategory, getRequireFieldsTableData, saveRequireFieldsRule};
export type {RequireFieldsTableItem};
