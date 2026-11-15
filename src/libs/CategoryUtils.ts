import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyCategory} from '@src/types/onyx';
import type {ApprovalRule, MccGroup} from '@src/types/onyx/Policy';

import type {OnyxCollection} from 'react-native-onyx';

import {Str} from 'expensify-common';

import StringUtils from './StringUtils';
import {containsHtmlTag} from './ValidationUtils';

function formatRequireItemizedReceiptsOverText(
    translate: LocaleContextProps['translate'],
    policy: Policy,
    categoryMaxAmountNoItemizedReceipt: number | null | undefined,
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
) {
    const isAlwaysSelected = categoryMaxAmountNoItemizedReceipt === 0;
    const isNeverSelected = categoryMaxAmountNoItemizedReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE;

    if (isAlwaysSelected) {
        return translate(`workspace.rules.categoryRules.requireItemizedReceiptsOverList.always`);
    }

    if (isNeverSelected) {
        return translate(`workspace.rules.categoryRules.requireItemizedReceiptsOverList.never`);
    }

    if (policy?.maxExpenseAmountNoItemizedReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE || policy?.maxExpenseAmountNoItemizedReceipt === undefined) {
        return translate(`workspace.rules.categoryRules.requireItemizedReceiptsOverList.never`);
    }

    return translate(
        `workspace.rules.categoryRules.requireItemizedReceiptsOverList.default`,
        convertToDisplayString(policy.maxExpenseAmountNoItemizedReceipt, policy?.outputCurrency ?? CONST.CURRENCY.USD),
    );
}

function getCategoryApproverRule(approvalRules: ApprovalRule[], categoryName: string) {
    const approverRule = approvalRules?.find((rule) =>
        rule.applyWhen.find(({condition, field, value}) => condition === CONST.POLICY.RULE_CONDITIONS.MATCHES && field === CONST.POLICY.FIELDS.CATEGORY && value === categoryName),
    );
    return approverRule;
}

function updateCategoryInMccGroup(mccGroups: Record<string, MccGroup>, oldCategoryName: string, newCategoryName: string, shouldClearPendingAction?: boolean) {
    if (oldCategoryName === newCategoryName) {
        return mccGroups;
    }

    const updatedGroups: Record<string, MccGroup> = {};

    for (const [key, group] of Object.entries(mccGroups || {})) {
        updatedGroups[key] =
            group.category === oldCategoryName ? {...group, category: newCategoryName, pendingAction: shouldClearPendingAction ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE} : group;
    }

    return updatedGroups;
}

/**
 * Calculates count of all enabled options
 */
function getEnabledCategoriesCount(policyCategories: PolicyCategories | undefined): number {
    if (policyCategories === undefined) {
        return 0;
    }
    return Object.values(policyCategories).filter((policyCategory) => policyCategory.enabled).length;
}

/**
 * Returns the names of the enabled categories the member can use: those visible to everyone, or to the member explicitly.
 */
function getMemberVisibleCategoryNames(policyCategories: PolicyCategories | undefined, accountID: number): string[] {
    return Object.values(policyCategories ?? {})
        .filter((policyCategory) => policyCategory.enabled && isCategoryVisibleToMember(policyCategory, accountID))
        .map((policyCategory) => policyCategory.name);
}

/**
 * Returns the categories the expense's owner can use, keyed like the input. Disabled ones are kept, since the picker
 * filters those out itself.
 */
function getVisibleCategories(policyCategories: PolicyCategories, ownerAccountID: number): PolicyCategories {
    const visibleCategories: PolicyCategories = {};
    for (const [categoryName, category] of Object.entries(policyCategories)) {
        if (isCategoryVisibleToMember(category, ownerAccountID)) {
            visibleCategories[categoryName] = category;
        }
    }
    return visibleCategories;
}

/**
 * Returns the members who can use at least one of the categories being disabled but no other enabled category, so
 * disabling them would leave these members with nothing to choose from.
 */
function getMembersWithoutVisibleCategories(policyCategories: PolicyCategories | undefined, categoryNamesToDisable: string[], memberAccountIDs: number[]): number[] {
    const categoriesToDisable = new Set(categoryNamesToDisable);
    // Members who can use a category that stays enabled, and members who can use one being disabled. A category open
    // to everyone covers every member, so it's tracked as a flag rather than by adding every member to a set.
    const membersKeepingACategory = new Set<string>();
    const membersLosingACategory = new Set<string>();
    let isEveryoneLosingACategory = false;

    for (const category of Object.values(policyCategories ?? {})) {
        if (!category.enabled) {
            continue;
        }
        const isBeingDisabled = categoriesToDisable.has(category.name);
        if (!category.visibleTo) {
            if (!isBeingDisabled) {
                return [];
            }
            isEveryoneLosingACategory = true;
            continue;
        }
        const members = isBeingDisabled ? membersLosingACategory : membersKeepingACategory;
        for (const [accountID, isVisible] of Object.entries(category.visibleTo)) {
            if (isVisible) {
                members.add(accountID);
            }
        }
    }

    return memberAccountIDs.filter((accountID) => {
        const key = String(accountID);
        return !membersKeepingACategory.has(key) && (isEveryoneLosingACategory || membersLosingACategory.has(key));
    });
}

function isCategoryMissing(category: string | undefined): boolean {
    if (!category) {
        return true;
    }

    return category === CONST.SEARCH.CATEGORY_EMPTY_VALUE || category === CONST.SEARCH.CATEGORY_DEFAULT_VALUE;
}

/**
 * Returns true when the category is visible to everyone or to this member.
 */
function isCategoryVisibleToMember(policyCategory: PolicyCategory | undefined, accountID: number): boolean {
    return !!policyCategory && (!policyCategory.visibleTo || !!policyCategory.visibleTo[accountID]);
}

function isCategoryDescriptionRequired(policyCategories: PolicyCategories | undefined, category: string | undefined, areRulesEnabled: boolean | undefined): boolean {
    if (!policyCategories || !category || !areRulesEnabled) {
        return false;
    }
    return !!policyCategories[category]?.areCommentsRequired;
}

function getCategoryDescriptionHint(policyCategories: PolicyCategories | undefined, category: string | undefined, areRulesEnabled: boolean | undefined): string {
    if (!policyCategories || !category || !areRulesEnabled) {
        return '';
    }
    return policyCategories[category]?.commentHint ?? '';
}

function getCategoryGLCode(policyCategories: PolicyCategories | undefined, category: string | undefined): string {
    if (!policyCategories || !category) {
        return '';
    }
    const glCode = policyCategories[category]?.['GL Code'];
    return glCode != null ? String(glCode).replaceAll('"', '') : '';
}

/**
 * Whether at least one selectable category on the workspace has a non-blank GL code. Disabled and pending-deletion
 * categories can't be picked in the category picker, so their GL codes don't count.
 */
function hasAnyCategoryGLCode(policyCategories: PolicyCategories | undefined): boolean {
    return Object.entries(policyCategories ?? {}).some(
        ([categoryName, category]) =>
            !!category?.enabled && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !!getCategoryGLCode(policyCategories, categoryName).trim(),
    );
}

function getDecodedCategoryName(categoryName: string) {
    return Str.htmlDecode(categoryName);
}

/** The reason a proposed category name is invalid. Callers translate it via `getCategoryNameErrorMessage`. */
type CategoryNameError =
    | typeof CONST.INPUT_VALIDATION_ERRORS.REQUIRED
    | typeof CONST.INPUT_VALIDATION_ERRORS.EXISTING
    | typeof CONST.INPUT_VALIDATION_ERRORS.INVALID
    | typeof CONST.INPUT_VALIDATION_ERRORS.TOO_LONG;

/**
 * Validates a category name against every rule (required, HTML-like characters, unique, reserved, length). This is the single
 * source of truth shared by the create form, the RHP edit form, and inline table editing. Pass
 * `currentName` (the decoded display name) when editing so renaming a category to its own name isn't flagged
 * as a duplicate. Uniqueness also matches HTML-encoded stored names such as `Food &amp; Drink` vs `Food & Drink`.
 * Returns an error code, or undefined when the name is valid.
 */
function getCategoryNameError(policyCategories: PolicyCategories | undefined, newName: string, currentName?: string): CategoryNameError | undefined {
    const sanitized = StringUtils.sanitizeName(newName);

    if (StringUtils.isEmptyString(sanitized)) {
        return CONST.INPUT_VALIDATION_ERRORS.REQUIRED;
    }

    // The Name page rejects these in FormProvider. Inline rename only calls this helper, so `</>` would otherwise save from the table.
    if (containsHtmlTag(sanitized)) {
        return CONST.INPUT_VALIDATION_ERRORS.INVALID;
    }

    // Category keys may be HTML-encoded, so uniqueness compares decoded names. currentName is already decoded by the caller.
    if (sanitized !== currentName && Object.keys(policyCategories ?? {}).some((name) => getDecodedCategoryName(name) === sanitized)) {
        return CONST.INPUT_VALIDATION_ERRORS.EXISTING;
    }

    if (sanitized === CONST.INVALID_CATEGORY_NAME || sanitized === CONST.SEARCH.CATEGORY_DEFAULT_VALUE) {
        return CONST.INPUT_VALIDATION_ERRORS.INVALID;
    }

    // Spread to count Unicode code points rather than UTF-16 code units.
    if ([...sanitized].length > CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH) {
        return CONST.INPUT_VALIDATION_ERRORS.TOO_LONG;
    }

    return undefined;
}

/** Translates a {@link CategoryNameError} into a user-facing message for the given name. */
function getCategoryNameErrorMessage(translate: LocaleContextProps['translate'], error: CategoryNameError, name: string): string {
    switch (error) {
        case CONST.INPUT_VALIDATION_ERRORS.REQUIRED:
            return translate('workspace.categories.categoryRequiredError');
        case CONST.INPUT_VALIDATION_ERRORS.EXISTING:
            return translate('workspace.categories.existingCategoryError');
        case CONST.INPUT_VALIDATION_ERRORS.INVALID:
            return translate('workspace.categories.invalidCategoryName');
        case CONST.INPUT_VALIDATION_ERRORS.TOO_LONG:
        default:
            return translate('common.error.characterLimitExceedCounter', [...StringUtils.sanitizeName(name)].length, CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH);
    }
}

/**
 * Finds the stored key of a disabled category whose decoded name is `name`. Pickers hide disabled categories, so a
 * search can come up empty even though creating the name would fail as a duplicate. A category being deleted is also
 * stored as disabled until the server confirms, so it is skipped rather than offered back.
 */
function getDisabledCategoryKey(policyCategories: PolicyCategories | undefined, name: string): string | undefined {
    return Object.entries(policyCategories ?? {}).find(
        ([categoryKey, category]) => !category?.enabled && category?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && getDecodedCategoryName(categoryKey) === name,
    )?.[0];
}

/**
 * Whether a category picker search for `name` can be turned into a category in one tap: either a valid new name, or
 * the name of a disabled category that can be turned back on. Reserved names, HTML and over-long names never qualify.
 */
function canCreateCategoryFromSearch(policyCategories: PolicyCategories | undefined, name: string): boolean {
    const disabledCategoryKey = getDisabledCategoryKey(policyCategories, name);

    // Passing the name as `currentName` skips only the duplicate check, so a disabled match still has to pass every other rule.
    return !getCategoryNameError(policyCategories, name, disabledCategoryKey ? name : undefined);
}

/**
 * Splits a category name on the colon separator, removes empty middle segments,
 * and merges a trailing empty segment into the previous part (preserving trailing colons).
 *
 * Examples:
 *   "Food: Meat" → ["Food", "Meat"]
 *   "A: B:" → ["A", "B:"]
 *   "A: B: :" → ["A", "B:"]
 *   "A: B::" → ["A", "B:"]
 *   "A: B:::" → ["A", "B:"]
 *   ":D" → ["D"]
 *   "Plain" → ["Plain"]
 */
function processCategoryNameSegments(categoryName: string): string[] {
    const parts = categoryName.split(CONST.PARENT_CHILD_SEPARATOR);
    const result: string[] = [];

    // Keep only parts that contain at least one non‑whitespace character.
    for (let i = 0; i < parts.length; i++) {
        const part = parts.at(i);
        if (part === undefined) {
            continue;
        }
        if (part.trim() !== '') {
            result.push(part);
        }
    }

    // If all segments were empty but the original name is not empty,
    // treat the whole name as a single segment (e.g., ":" or "::").
    if (result.length === 0 && categoryName.trim() !== '') {
        return [categoryName.trim()];
    }

    // If the original name ends with a colon (allowing trailing spaces), append a colon to the last segment.
    const endsWithColon = categoryName.trim().endsWith(CONST.PARENT_CHILD_SEPARATOR);
    if (endsWithColon && result.length > 0) {
        result[result.length - 1] = result.at(result.length - 1) + CONST.PARENT_CHILD_SEPARATOR;
    }

    return result;
}

function getDecodedLeafCategoryName(categoryName: string): string {
    const segments = processCategoryNameSegments(categoryName);
    const leaf = segments.at(segments.length - 1) ?? '';
    return Str.htmlDecode(leaf.trim());
}

function getDecodedFullCategoryName(categoryName: string): string {
    const segments = processCategoryNameSegments(categoryName).map((segment) => segment.trim());
    return Str.htmlDecode(segments.join(`${CONST.PARENT_CHILD_SEPARATOR} `));
}

function getAvailableNonPersonalPolicyCategories(policyCategories: OnyxCollection<PolicyCategories>, personalPolicyID: string | undefined) {
    return Object.fromEntries(
        Object.entries(policyCategories ?? {}).filter(([key, categories]) => {
            if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${personalPolicyID}`) {
                return false;
            }
            const availableCategories = Object.values(categories ?? {}).filter((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            return availableCategories.length > 0;
        }),
    );
}

function hasAnyCategoryRules(categories: PolicyCategories | undefined): boolean {
    return Object.values(categories ?? {}).some((category) => {
        if (category.maxExpenseAmount !== undefined && category.maxExpenseAmount !== null && category.maxExpenseAmount !== CONST.DISABLED_MAX_EXPENSE_VALUE) {
            return true;
        }
        // null means "use policy default" (inactive); 0 = always required, DISABLED_MAX_EXPENSE_VALUE = never required — both are explicit overrides
        if (category.maxAmountNoReceipt !== undefined && category.maxAmountNoReceipt !== null) {
            return true;
        }
        if (category.maxAmountNoItemizedReceipt !== undefined && category.maxAmountNoItemizedReceipt !== null) {
            return true;
        }
        if (category.areCommentsRequired || category.areAttendeesRequired) {
            return true;
        }
        return !!category.commentHint;
    });
}

export {
    formatRequireItemizedReceiptsOverText,
    getCategoryApproverRule,
    updateCategoryInMccGroup,
    getEnabledCategoriesCount,
    getMemberVisibleCategoryNames,
    getVisibleCategories,
    getMembersWithoutVisibleCategories,
    isCategoryMissing,
    isCategoryDescriptionRequired,
    getCategoryDescriptionHint,
    getCategoryGLCode,
    hasAnyCategoryGLCode,
    getDecodedCategoryName,
    getDecodedLeafCategoryName,
    getDecodedFullCategoryName,
    processCategoryNameSegments,
    getAvailableNonPersonalPolicyCategories,
    hasAnyCategoryRules,
    getCategoryNameError,
    getCategoryNameErrorMessage,
    getDisabledCategoryKey,
    canCreateCategoryFromSearch,
    isCategoryVisibleToMember,
};
