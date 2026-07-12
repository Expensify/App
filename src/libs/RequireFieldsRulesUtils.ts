import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TableData} from '@components/Table';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';
import type PolicyData from '@hooks/usePolicyData/types';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {RequireFieldsRuleForm, RequireFieldsRuleSettingFieldKey} from '@src/types/form/RequireFieldsRuleForm';
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
    setPolicyCategoryReceiptsAndItemizedReceiptRequired,
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
    typeLabel: string;
    conditionText: string;
    ruleDescription: string;
    searchTokens: string[];
    pendingAction?: PendingAction;
    action: () => void;
};

function getRequireFieldsRuleKey(categoryName: string): string {
    return categoryName;
}

function parseRequireFieldsRuleKey(ruleKey: string): {categoryName: string} {
    return {categoryName: ruleKey};
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

type RequireFieldsPendingFieldKey = 'areCommentsRequired' | 'areAttendeesRequired' | 'maxAmountNoReceipt' | 'maxAmountNoItemizedReceipt';

function isRequireFieldsFieldPendingDelete(category: PolicyCategory, field: RequireFieldsPendingFieldKey): boolean {
    return category.pendingFields?.[field] === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

function isDescriptionRequiredForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return !!category.areCommentsRequired && (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'areCommentsRequired'));
}

function isAttendeesRequiredForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return !!category.areAttendeesRequired && (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'areAttendeesRequired'));
}

function isReceiptRequireOverrideForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return (
        hasCategoryReceiptOverride(category.maxAmountNoReceipt) &&
        hasExplicitReceiptThreshold(category.maxAmountNoReceipt) &&
        (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'maxAmountNoReceipt'))
    );
}

function isItemizedReceiptRequireOverrideForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return (
        hasCategoryReceiptOverride(category.maxAmountNoItemizedReceipt) &&
        hasExplicitReceiptThreshold(category.maxAmountNoItemizedReceipt) &&
        (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'maxAmountNoItemizedReceipt'))
    );
}

function isReceiptWaivedForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return isWaiveReceiptThreshold(category.maxAmountNoReceipt) && (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'maxAmountNoReceipt'));
}

function isItemizedReceiptWaivedForCategory(category: PolicyCategory, shouldIncludePendingDeleteFields = false): boolean {
    return isWaiveReceiptThreshold(category.maxAmountNoItemizedReceipt) && (shouldIncludePendingDeleteFields || !isRequireFieldsFieldPendingDelete(category, 'maxAmountNoItemizedReceipt'));
}

function categoryHasAnyRequireFieldsRule(category: PolicyCategory): boolean {
    return (
        isDescriptionRequiredForCategory(category) ||
        isAttendeesRequiredForCategory(category) ||
        isReceiptRequireOverrideForCategory(category) ||
        isItemizedReceiptRequireOverrideForCategory(category) ||
        isReceiptWaivedForCategory(category) ||
        isItemizedReceiptWaivedForCategory(category)
    );
}

function getDescriptionSettingFromCategory(category: PolicyCategory | undefined): FieldRequirementsDirection {
    if (!category) {
        return CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;
    }

    return isDescriptionRequiredForCategory(category) ? CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE : CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;
}

function getAttendeesSettingFromCategory(category: PolicyCategory | undefined): FieldRequirementsDirection {
    if (!category) {
        return CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;
    }

    return isAttendeesRequiredForCategory(category) ? CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE : CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;
}

function getReceiptSettingFromCategory(category: PolicyCategory | undefined): FieldRequirementsDirection {
    if (!category) {
        return CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;
    }

    if (isReceiptRequireOverrideForCategory(category)) {
        return CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE;
    }

    return CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;
}

function getItemizedReceiptSettingFromCategory(category: PolicyCategory | undefined): FieldRequirementsDirection {
    if (!category) {
        return CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;
    }

    if (isItemizedReceiptRequireOverrideForCategory(category)) {
        return CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE;
    }

    return CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;
}

function getRequireFieldsFormFromCategory(category: PolicyCategory | undefined): Partial<RequireFieldsRuleForm> {
    return {
        [INPUT_IDS.DESCRIPTION_SETTING]: getDescriptionSettingFromCategory(category),
        [INPUT_IDS.ATTENDEES_SETTING]: getAttendeesSettingFromCategory(category),
        [INPUT_IDS.RECEIPT_SETTING]: getReceiptSettingFromCategory(category),
        [INPUT_IDS.ITEMIZED_RECEIPT_SETTING]: getItemizedReceiptSettingFromCategory(category),
    };
}

function getEffectiveRequireFieldsRuleForm(category: PolicyCategory | undefined, form: Partial<RequireFieldsRuleForm>): RequireFieldsRuleForm {
    const categoryForm = getRequireFieldsFormFromCategory(category);

    return {
        [INPUT_IDS.CATEGORY]: form[INPUT_IDS.CATEGORY] ?? '',
        [INPUT_IDS.DESCRIPTION_SETTING]: form[INPUT_IDS.DESCRIPTION_SETTING] ?? categoryForm[INPUT_IDS.DESCRIPTION_SETTING] ?? CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
        [INPUT_IDS.ATTENDEES_SETTING]: form[INPUT_IDS.ATTENDEES_SETTING] ?? categoryForm[INPUT_IDS.ATTENDEES_SETTING] ?? CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
        [INPUT_IDS.RECEIPT_SETTING]: form[INPUT_IDS.RECEIPT_SETTING] ?? categoryForm[INPUT_IDS.RECEIPT_SETTING] ?? CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
        [INPUT_IDS.ITEMIZED_RECEIPT_SETTING]:
            form[INPUT_IDS.ITEMIZED_RECEIPT_SETTING] ?? categoryForm[INPUT_IDS.ITEMIZED_RECEIPT_SETTING] ?? CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
    };
}

function hasExplicitReceiptWaiveIntentForCategory(
    category: PolicyCategory | undefined,
    setting: FieldRequirementsDirection,
    wasFieldTouched: boolean,
    isWaived: (category: PolicyCategory) => boolean,
    isRequireOverride: (category: PolicyCategory) => boolean,
): boolean {
    if (!wasFieldTouched || setting !== CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE || !category) {
        return false;
    }

    return !isWaived(category) && !isRequireOverride(category);
}

function hasReceiptSettingsChanged(
    category: PolicyCategory | undefined,
    effectiveForm: RequireFieldsRuleForm,
    initialForm: Partial<RequireFieldsRuleForm>,
    touchedFields?: Set<RequireFieldsRuleSettingFieldKey>,
): boolean {
    if (effectiveForm[INPUT_IDS.RECEIPT_SETTING] !== initialForm[INPUT_IDS.RECEIPT_SETTING]) {
        return true;
    }

    if (effectiveForm[INPUT_IDS.ITEMIZED_RECEIPT_SETTING] !== initialForm[INPUT_IDS.ITEMIZED_RECEIPT_SETTING]) {
        return true;
    }

    return (
        hasExplicitReceiptWaiveIntentForCategory(
            category,
            effectiveForm[INPUT_IDS.RECEIPT_SETTING],
            !!touchedFields?.has(INPUT_IDS.RECEIPT_SETTING),
            isReceiptWaivedForCategory,
            isReceiptRequireOverrideForCategory,
        ) ||
        hasExplicitReceiptWaiveIntentForCategory(
            category,
            effectiveForm[INPUT_IDS.ITEMIZED_RECEIPT_SETTING],
            !!touchedFields?.has(INPUT_IDS.ITEMIZED_RECEIPT_SETTING),
            isItemizedReceiptWaivedForCategory,
            isItemizedReceiptRequireOverrideForCategory,
        )
    );
}

function hasRequireFieldsRuleChanges(category: PolicyCategory | undefined, effectiveForm: RequireFieldsRuleForm, touchedFields?: Set<RequireFieldsRuleSettingFieldKey>): boolean {
    const initialForm = getRequireFieldsFormFromCategory(category);

    if (
        effectiveForm[INPUT_IDS.DESCRIPTION_SETTING] !== initialForm[INPUT_IDS.DESCRIPTION_SETTING] ||
        effectiveForm[INPUT_IDS.ATTENDEES_SETTING] !== initialForm[INPUT_IDS.ATTENDEES_SETTING]
    ) {
        return true;
    }

    return hasReceiptSettingsChanged(category, effectiveForm, initialForm, touchedFields);
}

type ReceiptOverrideTarget = number | null | undefined;

function getReceiptOverrideTarget(currentValue: number | null | undefined, setting: FieldRequirementsDirection): ReceiptOverrideTarget {
    if (setting === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE) {
        if (isWaiveReceiptThreshold(currentValue) || !hasExplicitReceiptThreshold(currentValue)) {
            return 0;
        }

        return undefined;
    }

    if (!isWaiveReceiptThreshold(currentValue)) {
        return CONST.DISABLED_MAX_EXPENSE_VALUE;
    }

    return undefined;
}

function isReceiptOverrideValue(value: ReceiptOverrideTarget): value is number {
    return typeof value === 'number';
}

function shouldApplyReceiptFieldSetting(
    fieldKey: typeof INPUT_IDS.RECEIPT_SETTING | typeof INPUT_IDS.ITEMIZED_RECEIPT_SETTING,
    category: PolicyCategory | undefined,
    effectiveForm: RequireFieldsRuleForm,
    initialForm: Partial<RequireFieldsRuleForm>,
    touchedFields?: Set<RequireFieldsRuleSettingFieldKey>,
): boolean {
    const setting = effectiveForm[fieldKey];
    const initialSetting = initialForm[fieldKey];

    if (setting !== initialSetting) {
        return true;
    }

    const isWaived = fieldKey === INPUT_IDS.RECEIPT_SETTING ? isReceiptWaivedForCategory : isItemizedReceiptWaivedForCategory;
    const isRequireOverride = fieldKey === INPUT_IDS.RECEIPT_SETTING ? isReceiptRequireOverrideForCategory : isItemizedReceiptRequireOverrideForCategory;

    return hasExplicitReceiptWaiveIntentForCategory(category, setting, !!touchedFields?.has(fieldKey), isWaived, isRequireOverride);
}

function applyRequireFieldsReceiptSettings(
    policyData: PolicyData,
    categoryName: string,
    category: PolicyCategory | undefined,
    effectiveForm: RequireFieldsRuleForm,
    initialForm: Partial<RequireFieldsRuleForm>,
    touchedFields?: Set<RequireFieldsRuleSettingFieldKey>,
) {
    const receiptSetting = effectiveForm[INPUT_IDS.RECEIPT_SETTING];
    const itemizedReceiptSetting = effectiveForm[INPUT_IDS.ITEMIZED_RECEIPT_SETTING];
    const shouldApplyReceiptSetting = shouldApplyReceiptFieldSetting(INPUT_IDS.RECEIPT_SETTING, category, effectiveForm, initialForm, touchedFields);
    const shouldApplyItemizedReceiptSetting = shouldApplyReceiptFieldSetting(INPUT_IDS.ITEMIZED_RECEIPT_SETTING, category, effectiveForm, initialForm, touchedFields);

    let receiptTarget = shouldApplyReceiptSetting ? getReceiptOverrideTarget(category?.maxAmountNoReceipt, receiptSetting) : undefined;
    let itemizedTarget = shouldApplyItemizedReceiptSetting ? getReceiptOverrideTarget(category?.maxAmountNoItemizedReceipt, itemizedReceiptSetting) : undefined;

    if (shouldApplyReceiptSetting && receiptTarget === CONST.DISABLED_MAX_EXPENSE_VALUE && itemizedTarget === undefined && !isWaiveReceiptThreshold(category?.maxAmountNoItemizedReceipt)) {
        itemizedTarget = CONST.DISABLED_MAX_EXPENSE_VALUE;
    }

    if (
        shouldApplyItemizedReceiptSetting &&
        itemizedReceiptSetting === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE &&
        itemizedTarget === 0 &&
        receiptTarget !== 0 &&
        category?.maxAmountNoReceipt !== 0
    ) {
        receiptTarget = 0;
    }

    if (isReceiptOverrideValue(receiptTarget) && isReceiptOverrideValue(itemizedTarget)) {
        setPolicyCategoryReceiptsAndItemizedReceiptRequired(policyData, categoryName, receiptTarget, itemizedTarget);
        return;
    }

    if (receiptTarget === null) {
        removePolicyCategoryReceiptsRequired(policyData, categoryName);
    } else if (isReceiptOverrideValue(receiptTarget)) {
        setPolicyCategoryReceiptsRequired(policyData, categoryName, receiptTarget);
    }

    if (itemizedTarget === null) {
        removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
    } else if (isReceiptOverrideValue(itemizedTarget)) {
        setPolicyCategoryItemizedReceiptsRequired(policyData, categoryName, itemizedTarget);
    }
}

function saveRequireFieldsRule(policyData: PolicyData, form: RequireFieldsRuleForm, touchedFields?: Set<RequireFieldsRuleSettingFieldKey>) {
    const categoryName = form[INPUT_IDS.CATEGORY];
    if (!categoryName || !policyData.policy?.id) {
        return;
    }

    const policyCategories = policyData.categories;
    const category = policyCategories?.[categoryName];
    const initialForm = getRequireFieldsFormFromCategory(category);
    const effectiveForm = getEffectiveRequireFieldsRuleForm(category, form);

    if (effectiveForm[INPUT_IDS.DESCRIPTION_SETTING] !== initialForm[INPUT_IDS.DESCRIPTION_SETTING]) {
        setPolicyCategoryDescriptionRequired(
            policyData.policy.id,
            categoryName,
            effectiveForm[INPUT_IDS.DESCRIPTION_SETTING] === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
            policyCategories,
        );
    }

    if (effectiveForm[INPUT_IDS.ATTENDEES_SETTING] !== initialForm[INPUT_IDS.ATTENDEES_SETTING]) {
        setPolicyCategoryAttendeesRequired(policyData.policy.id, categoryName, effectiveForm[INPUT_IDS.ATTENDEES_SETTING] === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE, policyCategories);
    }

    if (hasReceiptSettingsChanged(category, effectiveForm, initialForm, touchedFields)) {
        applyRequireFieldsReceiptSettings(policyData, categoryName, category, effectiveForm, initialForm, touchedFields);
    }
}

function deleteRequireFieldsRule(policyData: PolicyData, ruleKey: string) {
    const {categoryName} = parseRequireFieldsRuleKey(ruleKey);
    if (!categoryName || !policyData.policy?.id) {
        return;
    }

    const policyID = policyData.policy.id;
    const policyCategories = policyData.categories;
    const category = policyCategories?.[categoryName];

    if (!category) {
        return;
    }

    if (isDescriptionRequiredForCategory(category)) {
        setPolicyCategoryDescriptionRequired(policyID, categoryName, false, policyCategories);
    }

    if (isAttendeesRequiredForCategory(category)) {
        setPolicyCategoryAttendeesRequired(policyID, categoryName, false, policyCategories);
    }

    if (isReceiptRequireOverrideForCategory(category) || isReceiptWaivedForCategory(category)) {
        removePolicyCategoryReceiptsRequired(policyData, categoryName);
    }

    if (isItemizedReceiptRequireOverrideForCategory(category) || isItemizedReceiptWaivedForCategory(category)) {
        removePolicyCategoryItemizedReceiptsRequired(policyData, categoryName);
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

function getRequireFieldsPendingFieldKeys(category: PolicyCategory): RequireFieldsPendingFieldKey[] {
    const pendingFields = category.pendingFields;
    const fieldKeys: RequireFieldsPendingFieldKey[] = [];

    if (pendingFields?.areCommentsRequired) {
        fieldKeys.push('areCommentsRequired');
    }

    if (pendingFields?.areAttendeesRequired) {
        fieldKeys.push('areAttendeesRequired');
    }

    if (pendingFields?.maxAmountNoReceipt && (hasExplicitReceiptThreshold(category.maxAmountNoReceipt) || isWaiveReceiptThreshold(category.maxAmountNoReceipt))) {
        fieldKeys.push('maxAmountNoReceipt');
    }

    if (pendingFields?.maxAmountNoItemizedReceipt && (hasExplicitReceiptThreshold(category.maxAmountNoItemizedReceipt) || isWaiveReceiptThreshold(category.maxAmountNoItemizedReceipt))) {
        fieldKeys.push('maxAmountNoItemizedReceipt');
    }

    return fieldKeys;
}

function getRequireFieldsPendingActionForCategory(category: PolicyCategory): PendingAction | undefined {
    const fieldKeys = getRequireFieldsPendingFieldKeys(category);
    const pendingActions = fieldKeys.map((field) => category.pendingFields?.[field]).filter((pendingAction): pendingAction is PendingAction => !!pendingAction);

    return pendingActions.find((pendingAction) => isPendingDeleteOrUpdate(pendingAction)) ?? pendingActions.at(0);
}

function getRequireFieldsRuleValidationError(
    form: RequireFieldsRuleForm | null | undefined,
    category: PolicyCategory | undefined,
    translate: LocaleContextProps['translate'],
    isEditing: boolean,
    touchedFields?: Set<RequireFieldsRuleSettingFieldKey>,
): string {
    if (!form?.[INPUT_IDS.CATEGORY]) {
        return translate('workspace.rules.requireFieldsRule.confirmErrorCategory');
    }

    const effectiveForm = getEffectiveRequireFieldsRuleForm(category, form);

    if (isEditing) {
        if (!hasRequireFieldsRuleChanges(category, effectiveForm, touchedFields)) {
            return translate('workspace.rules.requireFieldsRule.confirmErrorField');
        }

        return '';
    }

    if (!touchedFields || touchedFields.size === 0) {
        return translate('workspace.rules.requireFieldsRule.confirmErrorDoNotRequireField');
    }

    const hasRequireSetting = ([INPUT_IDS.DESCRIPTION_SETTING, INPUT_IDS.ATTENDEES_SETTING, INPUT_IDS.RECEIPT_SETTING, INPUT_IDS.ITEMIZED_RECEIPT_SETTING] as const).some(
        (fieldKey) => touchedFields.has(fieldKey) && effectiveForm[fieldKey] === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
    );

    const hasExplicitWaiveIntent =
        hasExplicitReceiptWaiveIntentForCategory(
            category,
            effectiveForm[INPUT_IDS.RECEIPT_SETTING],
            touchedFields.has(INPUT_IDS.RECEIPT_SETTING),
            isReceiptWaivedForCategory,
            isReceiptRequireOverrideForCategory,
        ) ||
        hasExplicitReceiptWaiveIntentForCategory(
            category,
            effectiveForm[INPUT_IDS.ITEMIZED_RECEIPT_SETTING],
            touchedFields.has(INPUT_IDS.ITEMIZED_RECEIPT_SETTING),
            isItemizedReceiptWaivedForCategory,
            isItemizedReceiptRequireOverrideForCategory,
        );

    if (!hasRequireSetting && !hasExplicitWaiveIntent) {
        return translate('workspace.rules.requireFieldsRule.confirmErrorDoNotRequireField');
    }

    return '';
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
    shouldIncludePendingDeleteFields = false,
): string[] {
    const descriptions: string[] = [];

    if (isDescriptionRequiredForCategory(category, shouldIncludePendingDeleteFields)) {
        descriptions.push(
            getRequireFieldsRuleDescription(
                translate,
                CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_DESCRIPTION,
                undefined,
                convertToDisplayString,
                policyCurrency,
                CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
            ),
        );
    }

    if (isReceiptRequireOverrideForCategory(category, shouldIncludePendingDeleteFields)) {
        descriptions.push(
            getRequireFieldsRuleDescription(
                translate,
                CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER,
                category.maxAmountNoReceipt ?? undefined,
                convertToDisplayString,
                policyCurrency,
                CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
            ),
        );
    }

    if (isItemizedReceiptRequireOverrideForCategory(category, shouldIncludePendingDeleteFields)) {
        descriptions.push(
            getRequireFieldsRuleDescription(
                translate,
                CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER,
                category.maxAmountNoItemizedReceipt ?? undefined,
                convertToDisplayString,
                policyCurrency,
                CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
            ),
        );
    }

    if (isAttendeesRequiredForCategory(category, shouldIncludePendingDeleteFields)) {
        descriptions.push(
            getRequireFieldsRuleDescription(
                translate,
                CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ATTENDEES,
                undefined,
                convertToDisplayString,
                policyCurrency,
                CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
            ),
        );
    }

    if (isReceiptWaivedForCategory(category, shouldIncludePendingDeleteFields)) {
        descriptions.push(
            getRequireFieldsRuleDescription(
                translate,
                CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER,
                category.maxAmountNoReceipt ?? undefined,
                convertToDisplayString,
                policyCurrency,
                CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
            ),
        );
    }

    if (isItemizedReceiptWaivedForCategory(category, shouldIncludePendingDeleteFields)) {
        descriptions.push(
            getRequireFieldsRuleDescription(
                translate,
                CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER,
                category.maxAmountNoItemizedReceipt ?? undefined,
                convertToDisplayString,
                policyCurrency,
                CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
            ),
        );
    }

    return descriptions;
}

function createRequireFieldsTableItem({
    policyID,
    categoryName,
    category,
    translate,
    convertToDisplayString,
    policyCurrency,
    onNavigate,
}: {
    policyID: string;
    categoryName: string;
    category: PolicyCategory;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    policyCurrency: string;
    onNavigate: (route: Route) => void;
}): RequireFieldsTableItem {
    const ruleKey = getRequireFieldsRuleKey(categoryName);
    const pendingAction = getRequireFieldsPendingActionForCategory(category);
    const isPendingDelete = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const decodedCategoryName = getDecodedCategoryName(categoryName);
    const conditionText = translate('workspace.rules.requireFieldsTable.conditionCategoryIs', decodedCategoryName);
    const typeLabel = translate('workspace.rules.requireFieldsRule.title');
    const ruleDescriptions = getRequireFieldsRuleDescriptionsForCategory(category, translate, convertToDisplayString, policyCurrency, isPendingDelete);
    const ruleDescription = formatRequireFieldsRuleDescriptions(ruleDescriptions);

    return {
        keyForList: ruleKey,
        ruleID: ruleKey,
        categoryName,
        typeLabel,
        conditionText,
        ruleDescription,
        searchTokens: [decodedCategoryName, ruleDescription, typeLabel, ...ruleDescriptions],
        pendingAction,
        disabled: isPendingDelete,
        action: () => {
            setDraftRequireFieldsRule({
                [INPUT_IDS.CATEGORY]: categoryName,
                ...getRequireFieldsFormFromCategory(category),
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

        const pendingAction = getRequireFieldsPendingActionForCategory(category);
        const isPendingDelete = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

        if (!isOffline && isPendingDelete) {
            continue;
        }

        if (!categoryHasAnyRequireFieldsRule(category) && !isPendingDelete) {
            continue;
        }

        const tableItem = createRequireFieldsTableItem({
            policyID,
            categoryName,
            category,
            translate,
            convertToDisplayString,
            policyCurrency,
            onNavigate,
        });

        if (tableItem.ruleDescription) {
            rules.push(tableItem);
        }
    }

    return rules.sort((a, b) => localeCompare(a.conditionText, b.conditionText));
}

type RequireFieldsRuleBackToRouteParams = {
    policyID: string;
    isEditing: boolean;
    categoryName?: string;
};

function getRequireFieldsRuleBackToRoute({policyID, isEditing, categoryName}: RequireFieldsRuleBackToRouteParams): Route {
    if (isEditing && categoryName) {
        return ROUTES.RULES_REQUIRE_FIELDS_RULE_EDIT.getRoute(policyID, categoryName);
    }

    return ROUTES.RULES_REQUIRE_FIELDS_RULE_NEW.getRoute(policyID);
}

function getRequireFieldsFieldSettingUpdate(
    fieldKey: RequireFieldsRuleSettingFieldKey,
    setting: FieldRequirementsDirection,
): {
    formUpdate: Partial<RequireFieldsRuleForm>;
    touchedFieldKeys: RequireFieldsRuleSettingFieldKey[];
} {
    if (fieldKey === INPUT_IDS.ITEMIZED_RECEIPT_SETTING && setting === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE) {
        return {
            formUpdate: {
                [INPUT_IDS.ITEMIZED_RECEIPT_SETTING]: CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
                [INPUT_IDS.RECEIPT_SETTING]: CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
            },
            touchedFieldKeys: [INPUT_IDS.ITEMIZED_RECEIPT_SETTING, INPUT_IDS.RECEIPT_SETTING],
        };
    }

    if (fieldKey === INPUT_IDS.RECEIPT_SETTING && setting === CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE) {
        return {
            formUpdate: {
                [INPUT_IDS.RECEIPT_SETTING]: CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
                [INPUT_IDS.ITEMIZED_RECEIPT_SETTING]: CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
            },
            touchedFieldKeys: [INPUT_IDS.RECEIPT_SETTING, INPUT_IDS.ITEMIZED_RECEIPT_SETTING],
        };
    }

    return {
        formUpdate: {[fieldKey]: setting},
        touchedFieldKeys: [fieldKey],
    };
}

function isRequireFieldsFieldCouplingDisabled(
    fieldKey: RequireFieldsRuleSettingFieldKey,
    effectiveForm: RequireFieldsRuleForm | undefined,
    category: PolicyCategory | undefined,
    touchedFields?: Set<RequireFieldsRuleSettingFieldKey>,
    isEditing = false,
): boolean {
    if (fieldKey === INPUT_IDS.RECEIPT_SETTING) {
        if (effectiveForm?.[INPUT_IDS.ITEMIZED_RECEIPT_SETTING] !== CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE) {
            return false;
        }

        return isEditing || !!touchedFields?.has(INPUT_IDS.ITEMIZED_RECEIPT_SETTING);
    }

    if (fieldKey === INPUT_IDS.ITEMIZED_RECEIPT_SETTING) {
        if (effectiveForm?.[INPUT_IDS.RECEIPT_SETTING] !== CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE) {
            return false;
        }

        if (isEditing && category && isReceiptWaivedForCategory(category)) {
            return true;
        }

        return !!touchedFields?.has(INPUT_IDS.RECEIPT_SETTING);
    }

    return false;
}

type RequireFieldsFieldCouplingTooltipKey = 'receiptDisabledWhenItemizedRequired' | 'itemizedDisabledWhenReceiptWaived';

function getRequireFieldsFieldCouplingTooltipKey(
    fieldKey: RequireFieldsRuleSettingFieldKey,
    effectiveForm: RequireFieldsRuleForm | undefined,
    category: PolicyCategory | undefined,
    touchedFields?: Set<RequireFieldsRuleSettingFieldKey>,
    isEditing = false,
): RequireFieldsFieldCouplingTooltipKey | undefined {
    if (!isRequireFieldsFieldCouplingDisabled(fieldKey, effectiveForm, category, touchedFields, isEditing)) {
        return undefined;
    }

    if (
        fieldKey === INPUT_IDS.RECEIPT_SETTING &&
        (touchedFields?.has(INPUT_IDS.ITEMIZED_RECEIPT_SETTING) || (isEditing && effectiveForm?.[INPUT_IDS.ITEMIZED_RECEIPT_SETTING] === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE))
    ) {
        return 'receiptDisabledWhenItemizedRequired';
    }

    if (fieldKey === INPUT_IDS.ITEMIZED_RECEIPT_SETTING && (touchedFields?.has(INPUT_IDS.RECEIPT_SETTING) || (isEditing && !!category && isReceiptWaivedForCategory(category)))) {
        return 'itemizedDisabledWhenReceiptWaived';
    }

    return undefined;
}

export {
    deleteRequireFieldsRule,
    getEffectiveRequireFieldsRuleForm,
    getRequireFieldsFieldCouplingTooltipKey,
    getRequireFieldsFieldSettingUpdate,
    getRequireFieldsFormFromCategory,
    getRequireFieldsRuleBackToRoute,
    getRequireFieldsRuleKey,
    getRequireFieldsRuleValidationError,
    getRequireFieldsTableData,
    isRequireFieldsFieldCouplingDisabled,
    saveRequireFieldsRule,
};
export type {FieldRequirementsDirection, RequireFieldsTableItem};
