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
    setPolicyCategoryItemizedReceiptsRequired,
    setPolicyCategoryReceiptsRequired,
} from './actions/Policy/Category';
import {setDraftRequireFieldsRule} from './actions/User';
import {getDecodedCategoryName} from './CategoryUtils';
import {isPendingDeleteOrUpdate} from './PolicyRulesUtils';

type RequireFieldsRuleType = DeepValueOf<typeof CONST.REQUIRE_FIELDS_RULE_TYPES>;
type FieldRequirementsDirection = DeepValueOf<typeof CONST.FIELD_REQUIREMENTS_DIRECTION>;

type RequireFieldsTableItem = TableData & {
    ruleID: string;
    categoryName: string;
    direction: FieldRequirementsDirection;
    typeLabel: string;
    conditionText: string;
    ruleDescription: string;
    searchTokens: string[];
    pendingAction?: PendingAction;
    action: () => void;
};

function getRequireFieldsRuleKey(direction: FieldRequirementsDirection, categoryName: string): string {
    return `${direction}${CONST.FIELD_REQUIREMENTS_RULE_KEY_SEPARATOR}${categoryName}`;
}

function parseRequireFieldsRuleKey(ruleKey: string): {
    direction?: FieldRequirementsDirection;
    categoryName: string;
} {
    const separator = CONST.FIELD_REQUIREMENTS_RULE_KEY_SEPARATOR;
    const separatorIndex = ruleKey.indexOf(separator);

    if (separatorIndex === -1) {
        return {categoryName: ruleKey};
    }

    const directionValue = ruleKey.slice(0, separatorIndex);
    const categoryName = ruleKey.slice(separatorIndex + separator.length);
    const direction = directionValue === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE || directionValue === CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE ? directionValue : undefined;

    return {direction, categoryName};
}

function getRequireFieldsRuleNavigationRoute(policyID: string, categoryName: string): Route {
    return ROUTES.RULES_REQUIRE_FIELDS_RULE_EDIT.getRoute(policyID, categoryName);
}

function isWaiveReceiptThreshold(value: number | null | undefined): boolean {
    return value === CONST.DISABLED_MAX_EXPENSE_VALUE;
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

function categoryHasRequireDirectionFields(category: PolicyCategory): boolean {
    return (
        !!category.areCommentsRequired ||
        !!category.areAttendeesRequired ||
        (hasCategoryReceiptOverride(category.maxAmountNoReceipt) && hasExplicitReceiptThreshold(category.maxAmountNoReceipt)) ||
        (hasCategoryReceiptOverride(category.maxAmountNoItemizedReceipt) && hasExplicitReceiptThreshold(category.maxAmountNoItemizedReceipt))
    );
}

function categoryHasWaiveDirectionFields(category: PolicyCategory): boolean {
    return isWaiveReceiptThreshold(category.maxAmountNoReceipt) || isWaiveReceiptThreshold(category.maxAmountNoItemizedReceipt);
}

function categoryHasAnyRequireFieldsRule(category: PolicyCategory): boolean {
    return categoryHasRequireDirectionFields(category) || categoryHasWaiveDirectionFields(category);
}

function inferFieldRequirementsDirection(category: PolicyCategory | undefined): FieldRequirementsDirection {
    if (!category) {
        return CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE;
    }

    if (categoryHasRequireDirectionFields(category)) {
        return CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE;
    }

    if (categoryHasWaiveDirectionFields(category)) {
        return CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;
    }

    return CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE;
}

function isRequireFieldEnabled(category: PolicyCategory | undefined, field: RequireFieldsRuleToggleFieldKey, direction: FieldRequirementsDirection): boolean {
    if (!category) {
        return false;
    }

    switch (field) {
        case INPUT_IDS.REQUIRE_DESCRIPTION:
            return direction === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE && !!category.areCommentsRequired;
        case INPUT_IDS.REQUIRE_ATTENDEES:
            return direction === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE && !!category.areAttendeesRequired;
        case INPUT_IDS.REQUIRE_RECEIPT:
            if (direction === CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE) {
                return isWaiveReceiptThreshold(category.maxAmountNoReceipt);
            }
            return hasExplicitReceiptThreshold(category.maxAmountNoReceipt);
        case INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT:
            if (direction === CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE) {
                return isWaiveReceiptThreshold(category.maxAmountNoItemizedReceipt);
            }
            return hasExplicitReceiptThreshold(category.maxAmountNoItemizedReceipt);
        default:
            return false;
    }
}

function getRequireFieldsFormFromCategory(
    category: PolicyCategory | undefined,
    direction: FieldRequirementsDirection = CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
): Partial<RequireFieldsRuleForm> {
    return {
        [INPUT_IDS.DIRECTION]: direction,
        [INPUT_IDS.REQUIRE_DESCRIPTION]: isRequireFieldEnabled(category, INPUT_IDS.REQUIRE_DESCRIPTION, direction),
        [INPUT_IDS.REQUIRE_ATTENDEES]: isRequireFieldEnabled(category, INPUT_IDS.REQUIRE_ATTENDEES, direction),
        [INPUT_IDS.REQUIRE_RECEIPT]: isRequireFieldEnabled(category, INPUT_IDS.REQUIRE_RECEIPT, direction),
        [INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT]: isRequireFieldEnabled(category, INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT, direction),
    };
}

function getEffectiveRequireFieldsRuleForm(category: PolicyCategory | undefined, form: Partial<RequireFieldsRuleForm>): RequireFieldsRuleForm {
    const direction = form[INPUT_IDS.DIRECTION] ?? inferFieldRequirementsDirection(category);
    const categoryForm = getRequireFieldsFormFromCategory(category, direction);

    return {
        [INPUT_IDS.CATEGORY]: form[INPUT_IDS.CATEGORY] ?? '',
        [INPUT_IDS.DIRECTION]: direction,
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
    const direction = form[INPUT_IDS.DIRECTION] ?? CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE;
    const initialForm = getRequireFieldsFormFromCategory(category, direction);
    const effectiveForm = getEffectiveRequireFieldsRuleForm(category, form);

    if (direction === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE) {
        if (effectiveForm.requireDescription !== initialForm.requireDescription) {
            setPolicyCategoryDescriptionRequired(policyData.policy.id, categoryName, !!effectiveForm.requireDescription, policyCategories);
        }

        if (effectiveForm.requireAttendees !== initialForm.requireAttendees) {
            setPolicyCategoryAttendeesRequired(policyData.policy.id, categoryName, !!effectiveForm.requireAttendees, policyCategories);
        }

        if (effectiveForm.requireReceipt !== initialForm.requireReceipt) {
            if (effectiveForm.requireReceipt) {
                setPolicyCategoryReceiptsRequired(policyData, categoryName, 0);
            } else if (hasCategoryReceiptOverride(category?.maxAmountNoReceipt)) {
                removePolicyCategoryReceiptsRequired(policyData, categoryName);
            }
        }

        if (effectiveForm.requireItemizedReceipt !== initialForm.requireItemizedReceipt) {
            if (effectiveForm.requireItemizedReceipt) {
                setPolicyCategoryItemizedReceiptsRequired(policyData, categoryName, 0);
            } else if (hasCategoryReceiptOverride(category?.maxAmountNoItemizedReceipt)) {
                removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
            }
        }

        return;
    }

    if (effectiveForm.requireReceipt !== initialForm.requireReceipt) {
        if (effectiveForm.requireReceipt) {
            setPolicyCategoryReceiptsRequired(policyData, categoryName, CONST.DISABLED_MAX_EXPENSE_VALUE);
        } else if (isWaiveReceiptThreshold(category?.maxAmountNoReceipt)) {
            removePolicyCategoryReceiptsRequired(policyData, categoryName);
        }
    }

    if (effectiveForm.requireItemizedReceipt !== initialForm.requireItemizedReceipt) {
        if (effectiveForm.requireItemizedReceipt) {
            setPolicyCategoryItemizedReceiptsRequired(policyData, categoryName, CONST.DISABLED_MAX_EXPENSE_VALUE);
        } else if (isWaiveReceiptThreshold(category?.maxAmountNoItemizedReceipt)) {
            removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
        }
    }
}

function deleteRequireFieldsRule(policyData: PolicyData, ruleKey: string) {
    const {direction, categoryName} = parseRequireFieldsRuleKey(ruleKey);
    if (!categoryName || !policyData.policy?.id) {
        return;
    }

    const policyID = policyData.policy.id;
    const policyCategories = policyData.categories;
    const category = policyCategories?.[categoryName];

    if (!category) {
        return;
    }

    const shouldDeleteRequireDirection = !direction || direction === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE;
    const shouldDeleteWaiveDirection = !direction || direction === CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;

    if (shouldDeleteRequireDirection) {
        if (category.areCommentsRequired) {
            setPolicyCategoryDescriptionRequired(policyID, categoryName, false, policyCategories);
        }

        if (category.areAttendeesRequired) {
            setPolicyCategoryAttendeesRequired(policyID, categoryName, false, policyCategories);
        }

        if (hasCategoryReceiptOverride(category.maxAmountNoReceipt) && hasExplicitReceiptThreshold(category.maxAmountNoReceipt)) {
            removePolicyCategoryReceiptsRequired(policyData, categoryName);
        }

        if (hasCategoryReceiptOverride(category.maxAmountNoItemizedReceipt) && hasExplicitReceiptThreshold(category.maxAmountNoItemizedReceipt)) {
            removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
        }
    }

    if (shouldDeleteWaiveDirection) {
        if (isWaiveReceiptThreshold(category.maxAmountNoReceipt)) {
            removePolicyCategoryReceiptsRequired(policyData, categoryName);
        }

        if (isWaiveReceiptThreshold(category.maxAmountNoItemizedReceipt)) {
            removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
        }
    }
}

function getRequireFieldsRuleDescription(
    translate: LocaleContextProps['translate'],
    ruleType: RequireFieldsRuleType,
    amount: number | undefined,
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
    policyCurrency: string,
    direction: FieldRequirementsDirection = CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
): string {
    if (direction === CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE) {
        switch (ruleType) {
            case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER:
                return translate('workspace.rules.requireFieldsTable.doNotRequireReceipt');
            case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER:
                return translate('workspace.rules.requireFieldsTable.doNotRequireItemizedReceipt');
            default:
                return '';
        }
    }

    switch (ruleType) {
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION:
            return translate('workspace.rules.requireFieldsTable.requireDescription');
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ATTENDEES:
            return translate('workspace.rules.requireFieldsTable.requireAttendees');
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER:
            if (amount === 0) {
                return translate('workspace.rules.requireFieldsTable.requireReceipt');
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
    direction: FieldRequirementsDirection,
): string[] {
    const descriptions: string[] = [];

    if (direction === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE) {
        if (category.areCommentsRequired) {
            descriptions.push(getRequireFieldsRuleDescription(translate, CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION, undefined, convertToDisplayString, policyCurrency, direction));
        }

        if (hasCategoryReceiptOverride(category.maxAmountNoReceipt) && hasExplicitReceiptThreshold(category.maxAmountNoReceipt)) {
            descriptions.push(
                getRequireFieldsRuleDescription(
                    translate,
                    CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER,
                    category.maxAmountNoReceipt ?? undefined,
                    convertToDisplayString,
                    policyCurrency,
                    direction,
                ),
            );
        }

        if (hasCategoryReceiptOverride(category.maxAmountNoItemizedReceipt) && hasExplicitReceiptThreshold(category.maxAmountNoItemizedReceipt)) {
            descriptions.push(
                getRequireFieldsRuleDescription(
                    translate,
                    CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER,
                    category.maxAmountNoItemizedReceipt ?? undefined,
                    convertToDisplayString,
                    policyCurrency,
                    direction,
                ),
            );
        }

        if (category.areAttendeesRequired) {
            descriptions.push(getRequireFieldsRuleDescription(translate, CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ATTENDEES, undefined, convertToDisplayString, policyCurrency, direction));
        }

        return descriptions;
    }

    if (isWaiveReceiptThreshold(category.maxAmountNoReceipt)) {
        descriptions.push(
            getRequireFieldsRuleDescription(
                translate,
                CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER,
                category.maxAmountNoReceipt ?? undefined,
                convertToDisplayString,
                policyCurrency,
                direction,
            ),
        );
    }

    if (isWaiveReceiptThreshold(category.maxAmountNoItemizedReceipt)) {
        descriptions.push(
            getRequireFieldsRuleDescription(
                translate,
                CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER,
                category.maxAmountNoItemizedReceipt ?? undefined,
                convertToDisplayString,
                policyCurrency,
                direction,
            ),
        );
    }

    return descriptions;
}

function getRequireFieldsTypeLabel(translate: LocaleContextProps['translate'], direction: FieldRequirementsDirection): string {
    if (direction === CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE) {
        return translate('workspace.rules.requireFieldsTable.typeLabelDoNotRequire');
    }

    return translate('workspace.rules.requireFieldsTable.typeLabelRequire');
}

function createRequireFieldsTableItem({
    policyID,
    categoryName,
    category,
    direction,
    translate,
    convertToDisplayString,
    policyCurrency,
    onNavigate,
}: {
    policyID: string;
    categoryName: string;
    category: PolicyCategory;
    direction: FieldRequirementsDirection;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    policyCurrency: string;
    onNavigate: (route: Route) => void;
}): RequireFieldsTableItem {
    const pendingAction = getRequireFieldsPendingAction(category.pendingFields);
    const decodedCategoryName = getDecodedCategoryName(categoryName);
    const conditionText = translate('workspace.rules.requireFieldsTable.conditionCategoryIs', decodedCategoryName);
    const typeLabel = getRequireFieldsTypeLabel(translate, direction);
    const ruleDescriptions = getRequireFieldsRuleDescriptionsForCategory(category, translate, convertToDisplayString, policyCurrency, direction);
    const ruleDescription = formatRequireFieldsRuleDescriptions(ruleDescriptions);

    return {
        keyForList: getRequireFieldsRuleKey(direction, categoryName),
        ruleID: categoryName,
        categoryName,
        direction,
        typeLabel,
        conditionText,
        ruleDescription,
        searchTokens: [decodedCategoryName, ruleDescription, typeLabel, ...ruleDescriptions],
        pendingAction,
        disabled: pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        action: () => {
            setDraftRequireFieldsRule({
                [INPUT_IDS.CATEGORY]: categoryName,
                ...getRequireFieldsFormFromCategory(category, direction),
            });
            onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName));
        },
    };
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
    const rules: RequireFieldsTableItem[] = [];

    for (const [categoryName, category] of Object.entries(policyCategories)) {
        if (!category?.enabled) {
            continue;
        }

        const pendingAction = getRequireFieldsPendingAction(category.pendingFields);
        const isPendingDelete = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

        if (!isOffline && isPendingDelete) {
            continue;
        }

        if (!categoryHasAnyRequireFieldsRule(category) && !isPendingDelete) {
            continue;
        }

        if (categoryHasRequireDirectionFields(category)) {
            rules.push(
                createRequireFieldsTableItem({
                    policyID,
                    categoryName,
                    category,
                    direction: CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
                    translate,
                    convertToDisplayString,
                    policyCurrency,
                    onNavigate,
                }),
            );
        }

        if (categoryHasWaiveDirectionFields(category)) {
            rules.push(
                createRequireFieldsTableItem({
                    policyID,
                    categoryName,
                    category,
                    direction: CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
                    translate,
                    convertToDisplayString,
                    policyCurrency,
                    onNavigate,
                }),
            );
        }
    }

    return rules.sort((a, b) => localeCompare(a.conditionText, b.conditionText));
}

export {
    categoryHasLegacyReceiptRules,
    deleteRequireFieldsRule,
    getEffectiveRequireFieldsRuleForm,
    getRequireFieldsFormFromCategory,
    getRequireFieldsRuleKey,
    getRequireFieldsTableData,
    inferFieldRequirementsDirection,
    parseRequireFieldsRuleKey,
    saveRequireFieldsRule,
};
export type {FieldRequirementsDirection, RequireFieldsTableItem};
