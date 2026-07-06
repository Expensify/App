import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TableData} from '@components/Table';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';
import type PolicyData from '@hooks/usePolicyData/types';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {RequireFieldsRuleForm, RequireFieldsRuleToggleFieldKey} from '@src/types/form/RequireFieldsRuleForm';
import INPUT_IDS from '@src/types/form/RequireFieldsRuleForm';
import type {Policy, PolicyCategories, PolicyCategory} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import {
    removePolicyCategoryItemizedReceiptsRequired,
    removePolicyCategoryReceiptsRequired,
    setPolicyCategoryAttendeesRequired,
    setPolicyCategoryDescriptionRequired,
} from './actions/Policy/Category';
import {getDecodedCategoryName} from './CategoryUtils';
import {isPendingDeleteOrUpdate} from './PolicyRulesUtils';

type RequireFieldsRuleType = DeepValueOf<typeof CONST.REQUIRE_FIELDS_RULE_TYPES>;

type RequireFieldsTableItem = TableData & {
    ruleID: string;
    categoryName: string;
    typeLabel: string;
    conditionText: string;
    ruleDescription: string;
    searchTokens: string[];
    pendingAction?: PendingAction;
    action: () => void;
};

function getRequireFieldsRuleNavigationRoute(policyID: string, categoryName: string): Route {
    return ROUTES.RULES_REQUIRE_FIELDS_RULE_EDIT.getRoute(policyID, categoryName);
}

function hasExplicitReceiptThreshold(value: number | null | undefined): value is number {
    return value !== null && value !== undefined && value !== CONST.DISABLED_MAX_EXPENSE_VALUE;
}

function hasCategoryReceiptOverride(value: number | null | undefined): boolean {
    return value !== null && value !== undefined;
}

function categoryHasLegacyReceiptRules(category: PolicyCategory | undefined): boolean {
    if (!category) {
        return false;
    }

    return hasCategoryReceiptOverride(category.maxAmountNoReceipt) || hasCategoryReceiptOverride(category.maxAmountNoItemizedReceipt);
}

function categoryHasAnyRequireFieldsRule(category: PolicyCategory): boolean {
    return (
        isRequireFieldEnabledForDisplay(category, INPUT_IDS.REQUIRE_DESCRIPTION) ||
        isRequireFieldEnabledForDisplay(category, INPUT_IDS.REQUIRE_ATTENDEES) ||
        hasCategoryReceiptOverrideForDisplay(category, 'maxAmountNoReceipt') ||
        hasCategoryReceiptOverrideForDisplay(category, 'maxAmountNoItemizedReceipt')
    );
}

function isRequireFieldEnabled(category: PolicyCategory | undefined, field: RequireFieldsRuleToggleFieldKey): boolean {
    if (!category) {
        return false;
    }

    switch (field) {
        case INPUT_IDS.REQUIRE_DESCRIPTION:
            return !!category.areCommentsRequired;
        case INPUT_IDS.REQUIRE_ATTENDEES:
            return !!category.areAttendeesRequired;
        case INPUT_IDS.REQUIRE_RECEIPT:
            return hasExplicitReceiptThreshold(category.maxAmountNoReceipt);
        case INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT:
            return hasExplicitReceiptThreshold(category.maxAmountNoItemizedReceipt);
        default:
            return false;
    }
}

function isRequireFieldPendingDelete(category: PolicyCategory | undefined, field: RequireFieldsRuleToggleFieldKey): boolean {
    if (!category?.pendingFields) {
        return false;
    }

    switch (field) {
        case INPUT_IDS.REQUIRE_DESCRIPTION:
            return category.pendingFields.areCommentsRequired === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        case INPUT_IDS.REQUIRE_ATTENDEES:
            return category.pendingFields.areAttendeesRequired === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        case INPUT_IDS.REQUIRE_RECEIPT:
            return category.pendingFields.maxAmountNoReceipt === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        case INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT:
            return category.pendingFields.maxAmountNoItemizedReceipt === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        default:
            return false;
    }
}

function isRequireFieldEnabledForDisplay(category: PolicyCategory | undefined, field: RequireFieldsRuleToggleFieldKey): boolean {
    if (isRequireFieldPendingDelete(category, field)) {
        return false;
    }

    return isRequireFieldEnabled(category, field);
}

function hasCategoryReceiptOverrideForDisplay(category: PolicyCategory | undefined, field: 'maxAmountNoReceipt' | 'maxAmountNoItemizedReceipt'): boolean {
    if (!category) {
        return false;
    }

    const pendingField = field === 'maxAmountNoReceipt' ? category.pendingFields?.maxAmountNoReceipt : category.pendingFields?.maxAmountNoItemizedReceipt;
    if (pendingField === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        return false;
    }

    return hasCategoryReceiptOverride(category[field]);
}

function getRequireFieldsFormFromCategory(category: PolicyCategory | undefined): Partial<RequireFieldsRuleForm> {
    return {
        [INPUT_IDS.REQUIRE_DESCRIPTION]: isRequireFieldEnabledForDisplay(category, INPUT_IDS.REQUIRE_DESCRIPTION),
        [INPUT_IDS.REQUIRE_ATTENDEES]: isRequireFieldEnabledForDisplay(category, INPUT_IDS.REQUIRE_ATTENDEES),
        [INPUT_IDS.REQUIRE_RECEIPT]: isRequireFieldEnabledForDisplay(category, INPUT_IDS.REQUIRE_RECEIPT),
        [INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT]: isRequireFieldEnabledForDisplay(category, INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT),
    };
}

function getEffectiveRequireFieldsRuleForm(category: PolicyCategory | undefined, form: Partial<RequireFieldsRuleForm>): RequireFieldsRuleForm {
    const categoryForm = getRequireFieldsFormFromCategory(category);

    return {
        [INPUT_IDS.CATEGORY]: form[INPUT_IDS.CATEGORY] ?? '',
        [INPUT_IDS.REQUIRE_DESCRIPTION]: form[INPUT_IDS.REQUIRE_DESCRIPTION] ?? categoryForm[INPUT_IDS.REQUIRE_DESCRIPTION] ?? false,
        [INPUT_IDS.REQUIRE_ATTENDEES]: form[INPUT_IDS.REQUIRE_ATTENDEES] ?? categoryForm[INPUT_IDS.REQUIRE_ATTENDEES] ?? false,
        [INPUT_IDS.REQUIRE_RECEIPT]: form[INPUT_IDS.REQUIRE_RECEIPT] ?? categoryForm[INPUT_IDS.REQUIRE_RECEIPT] ?? false,
        [INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT]: form[INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT] ?? categoryForm[INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT] ?? false,
    };
}

function saveRequireFieldsRule(policyData: PolicyData, form: RequireFieldsRuleForm) {
    const categoryName = form[INPUT_IDS.CATEGORY];
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
}

function deleteRequireFieldsRule(policyData: PolicyData, categoryName: string) {
    if (!categoryName || !policyData.policy?.id) {
        return;
    }

    const policyID = policyData.policy.id;
    const policyCategories = policyData.categories;
    const category = policyCategories?.[categoryName];

    if (!category) {
        return;
    }

    if (category.areCommentsRequired) {
        setPolicyCategoryDescriptionRequired(policyID, categoryName, false, policyCategories);
    }

    if (category.areAttendeesRequired) {
        setPolicyCategoryAttendeesRequired(policyID, categoryName, false, policyCategories);
    }

    if (hasCategoryReceiptOverride(category.maxAmountNoReceipt)) {
        removePolicyCategoryReceiptsRequired(policyData, categoryName);
    }

    if (hasCategoryReceiptOverride(category.maxAmountNoItemizedReceipt)) {
        removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
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

function getRequireFieldsPendingAction(category: PolicyCategory): PendingAction | undefined {
    if (category.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        return CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    }

    const pendingFieldActions = [
        category.pendingFields?.areCommentsRequired,
        category.pendingFields?.areAttendeesRequired,
        category.pendingFields?.maxAmountNoReceipt,
        category.pendingFields?.maxAmountNoItemizedReceipt,
    ].filter((pendingAction): pendingAction is PendingAction => !!pendingAction);

    if (pendingFieldActions.length === 0) {
        return undefined;
    }

    // Field-level removals use pending DELETE on the field, but the row should stay visible and editable.
    if (pendingFieldActions.some((pendingAction) => isPendingDeleteOrUpdate(pendingAction))) {
        return CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
    }

    return pendingFieldActions.at(0);
}

function formatRequireFieldsRuleDescriptions(descriptions: string[]): string {
    if (descriptions.length === 0) {
        return '';
    }

    const [first, ...rest] = descriptions;
    const capitalizedFirst = first.charAt(0).toUpperCase() + first.slice(1);
    const lowercasedRest = rest.map((description) => description.charAt(0).toLowerCase() + description.slice(1));

    return [capitalizedFirst, ...lowercasedRest].join(', ');
}

function getRequireFieldsRuleDescriptionsForCategory(
    category: PolicyCategory,
    translate: LocaleContextProps['translate'],
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
    policyCurrency: string,
): string[] {
    const descriptions: string[] = [];

    if (isRequireFieldEnabledForDisplay(category, INPUT_IDS.REQUIRE_DESCRIPTION)) {
        descriptions.push(getRequireFieldsRuleDescription(translate, CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION, undefined, convertToDisplayString, policyCurrency));
    }

    if (hasCategoryReceiptOverrideForDisplay(category, 'maxAmountNoReceipt')) {
        descriptions.push(
            getRequireFieldsRuleDescription(
                translate,
                CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER,
                category.maxAmountNoReceipt ?? undefined,
                convertToDisplayString,
                policyCurrency,
            ),
        );
    }

    if (hasCategoryReceiptOverrideForDisplay(category, 'maxAmountNoItemizedReceipt')) {
        descriptions.push(
            getRequireFieldsRuleDescription(
                translate,
                CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER,
                category.maxAmountNoItemizedReceipt ?? undefined,
                convertToDisplayString,
                policyCurrency,
            ),
        );
    }

    if (isRequireFieldEnabledForDisplay(category, INPUT_IDS.REQUIRE_ATTENDEES)) {
        descriptions.push(getRequireFieldsRuleDescription(translate, CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ATTENDEES, undefined, convertToDisplayString, policyCurrency));
    }

    return descriptions;
}

function getRequireFieldsTableData({
    policy,
    policyCategories,
    translate,
    convertToDisplayString,
    localeCompare,
    isOffline,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyCategories: PolicyCategories | undefined;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    localeCompare: LocaleContextProps['localeCompare'];
    isOffline: boolean;
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

        const pendingAction = getRequireFieldsPendingAction(category);
        const isCategoryPendingDelete = category.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

        if (!isOffline && isCategoryPendingDelete) {
            continue;
        }

        if (!categoryHasAnyRequireFieldsRule(category) && !isCategoryPendingDelete) {
            continue;
        }

        const decodedCategoryName = getDecodedCategoryName(categoryName);
        const conditionText = translate('workspace.rules.requireFieldsTable.conditionCategoryIs', decodedCategoryName);
        const ruleDescriptions = getRequireFieldsRuleDescriptionsForCategory(category, translate, convertToDisplayString, policyCurrency);
        const ruleDescription = formatRequireFieldsRuleDescriptions(ruleDescriptions);

        rules.push({
            keyForList: categoryName,
            ruleID: categoryName,
            categoryName,
            typeLabel,
            conditionText,
            ruleDescription,
            searchTokens: [decodedCategoryName, ruleDescription, typeLabel, ...ruleDescriptions],
            pendingAction,
            disabled: isCategoryPendingDelete,
            action: () => onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName)),
        });
    }

    return rules.sort((a, b) => localeCompare(a.conditionText, b.conditionText));
}

function countCategoriesWithRequireFieldsRules(policyCategories: PolicyCategories | undefined): number {
    if (!policyCategories) {
        return 0;
    }

    return Object.values(policyCategories).filter((category) => category?.enabled && categoryHasAnyRequireFieldsRule(category)).length;
}

export {
    categoryHasAnyRequireFieldsRule,
    categoryHasLegacyReceiptRules,
    countCategoriesWithRequireFieldsRules,
    deleteRequireFieldsRule,
    getEffectiveRequireFieldsRuleForm,
    getRequireFieldsFormFromCategory,
    getRequireFieldsTableData,
    saveRequireFieldsRule,
};
export type {RequireFieldsTableItem};
