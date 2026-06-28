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
import {isPendingDeleteOrUpdate} from './PolicyRulesUtils';

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
    return `${encodeURIComponent(categoryName)}${RULE_KEY_SEPARATOR}${ruleType}`;
}

function parseRequireFieldsRuleKey(ruleKey: string): {categoryName: string; ruleType: RequireFieldsRuleType} | undefined {
    const separatorIndex = ruleKey.lastIndexOf(RULE_KEY_SEPARATOR);
    if (separatorIndex === -1) {
        return undefined;
    }

    const encodedCategoryName = ruleKey.slice(0, separatorIndex);
    const ruleTypeCandidate = ruleKey.slice(separatorIndex + RULE_KEY_SEPARATOR.length);
    const ruleType = Object.values(CONST.REQUIRE_FIELDS_RULE_TYPES).find((type) => type === ruleTypeCandidate);

    if (!ruleType) {
        return undefined;
    }

    let categoryName: string;
    try {
        categoryName = decodeURIComponent(encodedCategoryName);
    } catch {
        return undefined;
    }

    return {categoryName, ruleType};
}

function getRequireFieldsRuleNavigationRoute(policyID: string, categoryName: string): Route {
    return ROUTES.RULES_REQUIRE_FIELDS_RULE_EDIT.getRoute(policyID, categoryName);
}

function hasExplicitReceiptThreshold(value: number | null | undefined): value is number {
    return value !== null && value !== undefined && value !== CONST.DISABLED_MAX_EXPENSE_VALUE;
}

function isNeverReceiptRequired(value: number | null | undefined): boolean {
    return value === CONST.DISABLED_MAX_EXPENSE_VALUE;
}

function hasCustomNonZeroReceiptThreshold(value: number | null | undefined): boolean {
    return hasExplicitReceiptThreshold(value) && value !== 0;
}

function hasCategoryReceiptOverride(value: number | null | undefined): boolean {
    return value !== null && value !== undefined;
}

function categoryHasAnyRequireFieldsRule(category: PolicyCategory): boolean {
    return (
        !!category.areCommentsRequired ||
        !!category.areAttendeesRequired ||
        hasCategoryReceiptOverride(category.maxAmountNoReceipt) ||
        hasCategoryReceiptOverride(category.maxAmountNoItemizedReceipt)
    );
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

function getEffectiveRequireFieldsRuleForm(category: PolicyCategory | undefined, form: RequireFieldsRuleForm): RequireFieldsRuleForm {
    const categoryForm = getRequireFieldsFormFromCategory(category);

    return {
        category: form.category,
        requireDescription: form.requireDescription ?? categoryForm.requireDescription,
        requireAttendees: form.requireAttendees ?? categoryForm.requireAttendees,
        requireReceipt: form.requireReceipt ?? categoryForm.requireReceipt,
        requireItemizedReceipt: form.requireItemizedReceipt ?? categoryForm.requireItemizedReceipt,
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
    const effectiveForm = getEffectiveRequireFieldsRuleForm(category, form);

    if (effectiveForm.requireDescription !== initialForm.requireDescription) {
        setPolicyCategoryDescriptionRequired(policyData.policy.id, categoryName, !!effectiveForm.requireDescription, policyCategories);
    }

    if (effectiveForm.requireAttendees !== initialForm.requireAttendees) {
        setPolicyCategoryAttendeesRequired(policyData.policy.id, categoryName, !!effectiveForm.requireAttendees, policyCategories);
    }

    const shouldRequireReceipt = !!effectiveForm.requireReceipt;
    const shouldRequireItemizedReceipt = !!effectiveForm.requireItemizedReceipt;
    const hadReceipt = isRequireFieldEnabled(category, 'requireReceipt');
    const hadItemizedReceipt = isRequireFieldEnabled(category, 'requireItemizedReceipt');
    const hadNeverReceipt = isNeverReceiptRequired(category?.maxAmountNoReceipt);
    const hadNeverItemizedReceipt = isNeverReceiptRequired(category?.maxAmountNoItemizedReceipt);
    const skipReceiptSave = hasCustomNonZeroReceiptThreshold(category?.maxAmountNoReceipt);
    const skipItemizedSave = hasCustomNonZeroReceiptThreshold(category?.maxAmountNoItemizedReceipt);

    if (!skipReceiptSave && !skipItemizedSave && shouldRequireItemizedReceipt && !shouldRequireReceipt && !hadReceipt && !hadNeverReceipt) {
        setPolicyCategoryReceiptsAndItemizedReceiptRequired(policyData, categoryName, 0, 0);
    } else {
        if (!skipReceiptSave && (form.requireReceipt !== undefined || form.requireItemizedReceipt !== undefined)) {
            if (shouldRequireReceipt !== hadReceipt || (shouldRequireReceipt && hadNeverReceipt)) {
                if (shouldRequireReceipt) {
                    setPolicyCategoryReceiptsRequired(policyData, categoryName, 0);
                } else {
                    removePolicyCategoryReceiptsRequired(policyData, categoryName);
                    if (hadItemizedReceipt || hadNeverItemizedReceipt) {
                        removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
                    }
                }
            }
        }

        if (!skipItemizedSave && form.requireItemizedReceipt !== undefined) {
            if (shouldRequireItemizedReceipt !== hadItemizedReceipt || (shouldRequireItemizedReceipt && hadNeverItemizedReceipt)) {
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
}

function deleteRequireFieldsRule(policyData: PolicyData, ruleKey: string) {
    const parsedRule = parseRequireFieldsRuleKey(ruleKey);
    if (!parsedRule || !policyData.policy?.id) {
        return;
    }

    const {categoryName, ruleType} = parsedRule;
    const policyID = policyData.policy.id;
    const policyCategories = policyData.categories;
    const category = policyCategories?.[categoryName];

    switch (ruleType) {
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION:
            setPolicyCategoryDescriptionRequired(policyID, categoryName, false, policyCategories);
            break;
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ATTENDEES:
            setPolicyCategoryAttendeesRequired(policyID, categoryName, false, policyCategories);
            break;
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER:
            removePolicyCategoryReceiptsRequired(policyData, categoryName);
            if (
                isRequireFieldEnabled(category, 'requireItemizedReceipt') ||
                isNeverReceiptRequired(category?.maxAmountNoItemizedReceipt) ||
                hasCustomNonZeroReceiptThreshold(category?.maxAmountNoItemizedReceipt)
            ) {
                removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
            }
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
            if (amount === CONST.DISABLED_MAX_EXPENSE_VALUE) {
                return translate('workspace.rules.categoryRules.requireReceiptsOverList.never');
            }
            if (amount === 0) {
                return translate('workspace.rules.requireFieldsTable.alwaysRequireReceipt');
            }
            return translate('workspace.rules.requireFieldsTable.requireReceiptOver', convertToDisplayString(amount ?? 0, policyCurrency));
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER:
            if (amount === CONST.DISABLED_MAX_EXPENSE_VALUE) {
                return translate('workspace.rules.categoryRules.requireItemizedReceiptsOverList.never');
            }
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

function createRequireFieldsTableItem({
    categoryName,
    ruleType,
    typeLabel,
    conditionText,
    decodedCategoryName,
    pendingFields,
    policyID,
    translate,
    convertToDisplayString,
    policyCurrency,
    amount,
    onNavigate,
}: {
    categoryName: string;
    ruleType: RequireFieldsRuleType;
    typeLabel: string;
    conditionText: string;
    decodedCategoryName: string;
    pendingFields: PolicyCategories[string]['pendingFields'];
    policyID: string;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    policyCurrency: string;
    amount?: number;
    onNavigate: (route: Route) => void;
}): RequireFieldsTableItem {
    const ruleDescription = getRequireFieldsRuleDescription(translate, ruleType, amount, convertToDisplayString, policyCurrency);
    const pendingAction = getRequireFieldsPendingAction(ruleType, pendingFields);

    return {
        keyForList: getRequireFieldsRuleKey(categoryName, ruleType),
        ruleID: getRequireFieldsRuleKey(categoryName, ruleType),
        ruleType,
        categoryName,
        typeLabel,
        conditionText,
        ruleDescription,
        searchTokens: [decodedCategoryName, ruleDescription, typeLabel],
        pendingAction,
        disabled: isPendingDeleteOrUpdate(pendingAction),
        action: () => onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName)),
    };
}

function getRequireFieldsTableData({
    policy,
    policyCategories,
    translate,
    convertToDisplayString,
    localeCompare,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyCategories: PolicyCategories | undefined;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    localeCompare: LocaleContextProps['localeCompare'];
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
            rules.push(
                createRequireFieldsTableItem({
                    categoryName,
                    ruleType: CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION,
                    typeLabel,
                    conditionText,
                    decodedCategoryName,
                    pendingFields,
                    policyID,
                    translate,
                    convertToDisplayString,
                    policyCurrency,
                    onNavigate,
                }),
            );
        }

        if (category.areAttendeesRequired) {
            rules.push(
                createRequireFieldsTableItem({
                    categoryName,
                    ruleType: CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ATTENDEES,
                    typeLabel,
                    conditionText,
                    decodedCategoryName,
                    pendingFields,
                    policyID,
                    translate,
                    convertToDisplayString,
                    policyCurrency,
                    onNavigate,
                }),
            );
        }

        if (hasCategoryReceiptOverride(category.maxAmountNoReceipt)) {
            rules.push(
                createRequireFieldsTableItem({
                    categoryName,
                    ruleType: CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER,
                    typeLabel,
                    conditionText,
                    decodedCategoryName,
                    pendingFields,
                    policyID,
                    translate,
                    convertToDisplayString,
                    policyCurrency,
                    amount: category.maxAmountNoReceipt ?? undefined,
                    onNavigate,
                }),
            );
        }

        if (hasCategoryReceiptOverride(category.maxAmountNoItemizedReceipt)) {
            rules.push(
                createRequireFieldsTableItem({
                    categoryName,
                    ruleType: CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER,
                    typeLabel,
                    conditionText,
                    decodedCategoryName,
                    pendingFields,
                    policyID,
                    translate,
                    convertToDisplayString,
                    policyCurrency,
                    amount: category.maxAmountNoItemizedReceipt ?? undefined,
                    onNavigate,
                }),
            );
        }
    }

    return rules.sort((a, b) => localeCompare(a.conditionText, b.conditionText));
}

export {
    categoryHasAnyRequireFieldsRule,
    deleteRequireFieldsRule,
    getEffectiveRequireFieldsRuleForm,
    getRequireFieldsFormFromCategory,
    getRequireFieldsRuleDescription,
    getRequireFieldsTableData,
    hasCustomNonZeroReceiptThreshold,
    isNeverReceiptRequired,
    saveRequireFieldsRule,
};
export type {RequireFieldsTableItem};
