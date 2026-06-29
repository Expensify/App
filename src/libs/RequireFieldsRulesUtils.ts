import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TableData} from '@components/Table';
import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';
import type PolicyData from '@hooks/usePolicyData/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {RequireFieldsRuleForm, RequireFieldsRuleToggleFieldKey} from '@src/types/form/RequireFieldsRuleForm';
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

const REQUIRE_FIELDS_RULE_FIELDS = CONST.REQUIRE_FIELDS_RULE.FIELDS;

function isRequireFieldEnabled(category: PolicyCategory | undefined, field: RequireFieldsRuleToggleFieldKey): boolean {
    if (!category) {
        return false;
    }

    switch (field) {
        case REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_DESCRIPTION:
            return !!category.areCommentsRequired;
        case REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ATTENDEES:
            return !!category.areAttendeesRequired;
        case REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_RECEIPT:
            return hasExplicitReceiptThreshold(category.maxAmountNoReceipt);
        case REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ITEMIZED_RECEIPT:
            return hasExplicitReceiptThreshold(category.maxAmountNoItemizedReceipt);
        default:
            return false;
    }
}

function getRequireFieldsFormFromCategory(category: PolicyCategory | undefined): Partial<RequireFieldsRuleForm> {
    return {
        [REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_DESCRIPTION]: isRequireFieldEnabled(category, REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_DESCRIPTION),
        [REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ATTENDEES]: isRequireFieldEnabled(category, REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ATTENDEES),
        [REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_RECEIPT]: isRequireFieldEnabled(category, REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_RECEIPT),
        [REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ITEMIZED_RECEIPT]: isRequireFieldEnabled(category, REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ITEMIZED_RECEIPT),
    };
}

function getEffectiveRequireFieldsRuleForm(category: PolicyCategory | undefined, form: Partial<RequireFieldsRuleForm>): RequireFieldsRuleForm {
    const categoryForm = getRequireFieldsFormFromCategory(category);

    return {
        [REQUIRE_FIELDS_RULE_FIELDS.CATEGORY]: form[REQUIRE_FIELDS_RULE_FIELDS.CATEGORY] ?? '',
        [REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_DESCRIPTION]: form[REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_DESCRIPTION] ?? categoryForm[REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_DESCRIPTION] ?? false,
        [REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ATTENDEES]: form[REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ATTENDEES] ?? categoryForm[REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ATTENDEES] ?? false,
        [REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_RECEIPT]: form[REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_RECEIPT] ?? categoryForm[REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_RECEIPT] ?? false,
        [REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ITEMIZED_RECEIPT]:
            form[REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ITEMIZED_RECEIPT] ?? categoryForm[REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ITEMIZED_RECEIPT] ?? false,
    };
}

function saveRequireFieldsRule(policyData: PolicyData, form: RequireFieldsRuleForm) {
    const categoryName = form[REQUIRE_FIELDS_RULE_FIELDS.CATEGORY];
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
    const hadReceipt = isRequireFieldEnabled(category, REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_RECEIPT);
    const hadItemizedReceipt = isRequireFieldEnabled(category, REQUIRE_FIELDS_RULE_FIELDS.REQUIRE_ITEMIZED_RECEIPT);
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

function getRequireFieldsPendingAction(pendingFields: PolicyCategories[string]['pendingFields']): PendingAction | undefined {
    const pendingActions = [pendingFields?.areCommentsRequired, pendingFields?.areAttendeesRequired, pendingFields?.maxAmountNoReceipt, pendingFields?.maxAmountNoItemizedReceipt].filter(
        (pendingAction): pendingAction is PendingAction => !!pendingAction,
    );

    return pendingActions.find((pendingAction) => isPendingDeleteOrUpdate(pendingAction)) ?? pendingActions.at(0);
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

    if (category.areCommentsRequired) {
        descriptions.push(getRequireFieldsRuleDescription(translate, CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION, undefined, convertToDisplayString, policyCurrency));
    }

    if (hasCategoryReceiptOverride(category.maxAmountNoReceipt)) {
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

    if (hasCategoryReceiptOverride(category.maxAmountNoItemizedReceipt)) {
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

    if (category.areAttendeesRequired) {
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
        if (!category?.enabled || !categoryHasAnyRequireFieldsRule(category)) {
            continue;
        }

        const decodedCategoryName = getDecodedCategoryName(categoryName);
        const conditionText = translate('workspace.rules.requireFieldsTable.conditionCategoryIs', decodedCategoryName);
        const ruleDescriptions = getRequireFieldsRuleDescriptionsForCategory(category, translate, convertToDisplayString, policyCurrency);
        const ruleDescription = formatRequireFieldsRuleDescriptions(ruleDescriptions);
        const pendingAction = getRequireFieldsPendingAction(category.pendingFields);

        rules.push({
            keyForList: categoryName,
            ruleID: categoryName,
            categoryName,
            typeLabel,
            conditionText,
            ruleDescription,
            searchTokens: [decodedCategoryName, ruleDescription, typeLabel, ...ruleDescriptions],
            pendingAction,
            disabled: isPendingDeleteOrUpdate(pendingAction),
            action: () => onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName)),
        });
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
