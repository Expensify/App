import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TableData} from '@components/Table';
import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Policy, PolicyCategories} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {getDecodedCategoryName} from './CategoryUtils';
import createDynamicRoute from './Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {isAttendeeTrackingEnabled} from './PolicyUtils';

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

function getWorkspaceCategorySubPageRoute(policyID: string, categoryName: string, subPagePath: string): Route {
    const categorySettingsRoute = `${ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID)}/${DYNAMIC_ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(categoryName)}`;
    return createDynamicRoute(subPagePath, categorySettingsRoute);
}

function getRequireFieldsRuleNavigationRoute(policyID: string, categoryName: string, ruleType: RequireFieldsRuleType): Route {
    switch (ruleType) {
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER:
            return getWorkspaceCategorySubPageRoute(policyID, categoryName, DYNAMIC_ROUTES.WORKSPACE_CATEGORY_REQUIRE_RECEIPTS_OVER.path);
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER:
            return getWorkspaceCategorySubPageRoute(policyID, categoryName, DYNAMIC_ROUTES.WORKSPACE_CATEGORY_REQUIRE_ITEMIZED_RECEIPTS_OVER.path);
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION:
        case CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ATTENDEES:
        default:
            return getWorkspaceCategorySubPageRoute(policyID, categoryName, DYNAMIC_ROUTES.WORKSPACE_CATEGORY_REQUIRED_FIELDS.path);
    }
}

function hasExplicitReceiptThreshold(value: number | null | undefined): value is number {
    return value !== null && value !== undefined && value !== CONST.DISABLED_MAX_EXPENSE_VALUE;
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
    const isAttendeeTrackingOn = isAttendeeTrackingEnabled(policy);
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
                disabled: pendingFields?.areCommentsRequired === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                action: () => onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName, ruleType)),
            });
        }

        if (isAttendeeTrackingOn && category.areAttendeesRequired) {
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
                disabled: pendingFields?.areAttendeesRequired === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                action: () => onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName, ruleType)),
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
                disabled: pendingFields?.maxAmountNoReceipt === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                action: () => onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName, ruleType)),
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
                disabled: pendingFields?.maxAmountNoItemizedReceipt === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                action: () => onNavigate(getRequireFieldsRuleNavigationRoute(policyID, categoryName, ruleType)),
            });
        }
    }

    return rules.sort((a, b) => a.conditionText.localeCompare(b.conditionText));
}

export {getRequireFieldsRuleKey, getRequireFieldsRuleNavigationRoute, getRequireFieldsTableData, getWorkspaceCategorySubPageRoute, parseRequireFieldsRuleKey};
export type {RequireFieldsRuleType, RequireFieldsTableItem};
